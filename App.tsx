
import React, { useState } from 'react';
import { MOCK_PATIENTS } from './data/mockData';
import { PatientSidebar } from './components/PatientSidebar';
import { SoapView } from './components/SoapView';
import { Patient, ClinicalData } from './types';

// Simple Toast Component
const Toast = ({ message, type, show }: { message: string, type: 'success' | 'info', show: boolean }) => {
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-bold transition-all duration-300 z-50 flex items-center gap-2 ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'} ${type === 'success' ? 'bg-teal-500' : 'bg-gray-600'}`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
      )}
      {message}
    </div>
  );
};

// Helper to generate plain text from clinical data for EMR copy-paste
const generateCopyText = (patientName: string, date: string, data: ClinicalData) => {
  const { soap, pharmacy_focus, alerts, meta } = data;
  return `
--------------------------------------------------
診療記録: ${date}
患者: ${patientName}
--------------------------------------------------
【SOAP】
■ S (Subjective)
${soap.subjective}

■ O (Objective)
${soap.objective}

■ A (Assessment)
${soap.assessment}

■ P (Plan)
${soap.plan}

【薬学的介入・指導】
薬剤:
${pharmacy_focus.medications.map(m => `- ${m.name} ${m.dose} ${m.route} (${m.status}): ${m.reason_or_note}`).join('\n')}

指導・モニタリング:
${pharmacy_focus.patient_education.map(e => `・${e}`).join('\n')}
${pharmacy_focus.labs_and_monitoring.map(l => `・${l}`).join('\n')}

【Red Flags / アラート】
${alerts.red_flags.map(f => `・${f}`).join('\n')}
${alerts.need_to_contact_physician.length > 0 ? `※医師連絡要: ${alerts.need_to_contact_physician.join(', ')}` : ''}

【その他】
問題点: ${meta.main_problems.join(', ')}
--------------------------------------------------
`.trim();
};

function App() {
  // Use State for patients to allow updates (Approval status)
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;
  const selectedRecord = selectedPatient && selectedRecordId ? selectedPatient.records.find(r => r.id === selectedRecordId) : null;

  // Actions
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleBackToRecordList = () => {
    setSelectedRecordId(null);
  };

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id);
    setSelectedRecordId(null);
  };

  const handleSave = () => {
    // In a real app, this would save the dirty state to the backend
    showToast('一時保存しました', 'info');
  };

  const handleApprove = () => {
    if (!selectedPatientId || !selectedRecordId) return;

    // Update the record status to 'approved'
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          records: p.records.map(r => 
            r.id === selectedRecordId ? { ...r, status: 'approved' as const } : r
          )
        };
      }
      return p;
    });

    setPatients(updatedPatients);
    showToast('承認・完了しました', 'success');
  };

  const handleUnapprove = () => {
    // Optional: Allow un-approving for demo purposes
    if (!selectedPatientId || !selectedRecordId) return;

    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          records: p.records.map(r => 
            r.id === selectedRecordId ? { ...r, status: 'pending' as const } : r
          )
        };
      }
      return p;
    });

    setPatients(updatedPatients);
    showToast('修正モードに切り替えました', 'info');
  };

  const handleCopy = () => {
    if (!selectedPatient || !selectedRecord) return;
    const text = generateCopyText(selectedPatient.name, selectedRecord.date, selectedRecord.clinicalData);
    navigator.clipboard.writeText(text).then(() => {
      showToast('クリップボードにコピーしました', 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('コピーに失敗しました', 'info');
    });
  };

  const RecordList = ({ patient }: { patient: Patient }) => (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
              style={{ backgroundColor: patient.avatarColor }}
            >
              {patient.kana.charAt(0)}
            </div>
            <div>
               <div className="text-sm text-gray-500 font-medium mb-1">{patient.kana}</div>
               <h2 className="text-2xl font-bold text-gray-800 leading-none">{patient.name} <span className="text-lg font-normal text-gray-500 ml-2">({patient.age}歳)</span></h2>
               <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                 <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">ID: {patient.id.toUpperCase()}</span>
                 <span><i className="fa fa-birthday-cake"></i> {patient.birthDate.replace(/-/g, '/')} 生まれ</span>
                 <span className="text-teal-500 font-medium">{patient.gender === 'male' ? '男性' : '女性'}</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex justify-between items-center">
            <span>診療記録一覧</span>
            <span className="text-xs font-normal normal-case text-gray-400">{patient.records.length}件の記録</span>
          </h3>
          <div className="grid gap-4">
            {patient.records.map((record) => (
              <button 
                key={record.id}
                onClick={() => setSelectedRecordId(record.id)}
                className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-800">{record.date.replace(/-/g, '/')}</span>
                    {record.status === 'approved' ? (
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        承認済
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        要確認
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 group-hover:text-teal-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{record.clinicalData.soap.subjective}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 text-slate-700 font-sans overflow-hidden">
      
      {/* Sidebar (Always visible on desktop) */}
      <div className={`flex-shrink-0 h-full border-r border-gray-200 bg-white z-20 transition-all duration-300 ${!selectedPatientId ? 'w-full md:w-80' : 'hidden md:flex md:w-80'}`}>
        <PatientSidebar 
          patients={patients} 
          selectedId={selectedPatientId} 
          onSelect={handlePatientSelect} 
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full relative bg-gray-50 ${!selectedPatientId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
             {/* Back button for mobile patient list */}
             <button 
               onClick={() => setSelectedPatientId(null)} 
               className={`md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full ${!selectedPatientId ? 'hidden' : ''}`}
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>

             {/* Back button for record list */}
             {selectedRecordId && (
               <button 
                onClick={handleBackToRecordList}
                className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-teal-500 transition-colors mr-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 戻る
               </button>
             )}

             <div className="flex items-center gap-2">
               <span className="bg-gradient-to-br from-teal-400 to-teal-500 text-white p-1.5 rounded-lg shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </span>
               <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">よりそいPro <span className="hidden sm:inline text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 font-normal ml-2">Medical Edition</span></h1>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-400 font-medium">ログイン中</div>
              <div className="text-sm font-bold text-gray-700">担当者A</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
               <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {!selectedPatientId ? (
             // No Patient Selected (Desktop Placeholder)
             <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <p className="font-medium text-lg">左側のリストから患者を選択してください</p>
                <p className="text-sm mt-2 opacity-70">診療記録の閲覧・編集が行えます</p>
             </div>
          ) : !selectedRecordId && selectedPatient ? (
             // Patient Selected -> Show Record List
             <RecordList patient={selectedPatient} />
          ) : selectedRecord && selectedPatient ? (
             // Record Selected -> Show SoapView (Detail/Edit)
             <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn pb-24">
               {/* Mobile back to record list */}
               <button onClick={handleBackToRecordList} className="md:hidden mb-4 flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  記録一覧に戻る
               </button>

               <div className="mb-6 flex items-end justify-between sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-4 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                       <span className="font-mono">{selectedRecord.date.replace(/-/g, '/')}</span>
                       {selectedRecord.status === 'approved' && <span className="text-green-600 text-xs font-bold px-1.5 py-0.5 bg-green-50 border border-green-100 rounded">承認済</span>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 leading-none">{selectedPatient.name} 様 <span className="text-sm font-normal text-gray-500 ml-2">診療記録詳細</span></h2>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopy}
                      className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold rounded shadow-sm hover:bg-indigo-100 text-sm flex items-center gap-2 active:scale-95 transition-transform"
                      title="テキスト形式でコピー"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      <span className="hidden sm:inline">クリップボードにコピー</span>
                      <span className="sm:hidden">コピー</span>
                    </button>
                    <div className="w-px bg-gray-300 mx-1 h-8 self-center"></div>
                    <button 
                      onClick={handleSave}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded shadow-sm hover:bg-gray-50 text-sm active:scale-95 transition-transform"
                    >
                      一時保存
                    </button>
                    {selectedRecord.status === 'approved' ? (
                       <button 
                         onClick={handleUnapprove}
                         className="px-4 py-2 bg-gray-200 text-gray-600 font-bold rounded shadow-sm hover:bg-gray-300 text-sm flex items-center gap-2 active:scale-95 transition-transform"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                         修正する（承認解除）
                       </button>
                    ) : (
                       <button 
                         onClick={handleApprove}
                         className="px-4 py-2 bg-teal-500 text-white font-bold rounded shadow-sm hover:bg-teal-600 text-sm flex items-center gap-2 active:scale-95 transition-transform"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                         承認・完了
                       </button>
                    )}
                  </div>
               </div>
               
               <SoapView 
                 data={selectedRecord.clinicalData} 
                 transcript={selectedRecord.transcript} 
               />
             </div>
          ) : null}
        </main>

        <Toast message={toast.message} type={toast.type} show={toast.show} />

      </div>
    </div>
  );
}

export default App;