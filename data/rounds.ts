import { Facility, Round } from '../types';
import { MOCK_PATIENTS } from './mockData';

const pickRecord = (patientId: string) => {
  const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
  if (!patient || !patient.records[0]) {
    throw new Error(`Record not found for ${patientId}`);
  }
  const { clinicalData, transcript } = patient.records[0];
  return { clinicalData, transcript };
};

export const FACILITIES: Facility[] = [
  {
    id: 'f1',
    name: 'さくら苑',
    type: 'facility',
    address: '東京都江東区 1-2-3',
    roster: [
      { id: 'roster-p1', name: '田中 健', kana: 'タナカ ケン', room: '205', note: '糖尿病性足潰瘍' },
      { id: 'roster-p2', name: '佐藤 博', kana: 'サトウ ヒロシ', room: '110', note: '就労支援中' },
      { id: 'roster-p3', name: '鈴木 一郎', kana: 'スズキ イチロウ', room: '305', note: 'COPDフォロー' },
      { id: 'roster-p5', name: '渡辺 和子', kana: 'ワタナベ カズコ', room: '201', note: '大腿骨骨折リハ中' },
      { id: 'roster-p8', name: '山本 トメ', kana: 'ヤマモト トメ', room: '108', note: 'フレイル対策' },
    ],
  },
  {
    id: 'f2',
    name: '個人宅（港区・在宅医療）',
    type: 'home',
    address: '東京都港区',
    roster: [
      { id: 'roster-p6', name: '小林 勇', kana: 'コバヤシ イサム', note: 'キャッスルマン病' },
      { id: 'roster-p7', name: '加藤 美咲', kana: 'カトウ ミサキ', note: '術後創管理' },
      { id: 'roster-p9', name: '中村 健吾', kana: 'ナカムラ ケンゴ', note: '食物アレルギー' },
    ],
  },
];

export const ROUNDS: Round[] = [
  {
    id: 'round-2025-11-12-am',
    date: '2025-11-12',
    timeframe: '午前',
    facilityId: 'f1',
    segments: [
      {
        id: 'seg-1',
        order: 1,
        predictedName: 'タナカさん（足潰瘍）？',
        ...pickRecord('p1'),
        suggestedPatientId: 'roster-p1',
      },
      {
        id: 'seg-2',
        order: 2,
        predictedName: 'サトウさん？',
        ...pickRecord('p2'),
        suggestedPatientId: 'roster-p2',
      },
      {
        id: 'seg-3',
        order: 3,
        predictedName: 'ワタナベさん？',
        ...pickRecord('p5'),
        suggestedPatientId: 'roster-p5',
      },
    ],
  },
  {
    id: 'round-2025-11-12-pm',
    date: '2025-11-12',
    timeframe: '午後',
    facilityId: 'f1',
    segments: [
      {
        id: 'seg-4',
        order: 1,
        predictedName: 'スズキさん？',
        ...pickRecord('p3'),
        suggestedPatientId: 'roster-p3',
      },
      {
        id: 'seg-5',
        order: 2,
        predictedName: 'ヤマモトさん（むくみ相談）？',
        ...pickRecord('p8'),
        suggestedPatientId: 'roster-p8',
      },
    ],
  },
  {
    id: 'round-2025-11-10-am',
    date: '2025-11-10',
    timeframe: '午前',
    facilityId: 'f2',
    segments: [
      {
        id: 'seg-6',
        order: 1,
        predictedName: 'コバヤシさん？',
        ...pickRecord('p6'),
        suggestedPatientId: 'roster-p6',
      },
      {
        id: 'seg-7',
        order: 2,
        predictedName: 'カトウさん？',
        ...pickRecord('p7'),
        suggestedPatientId: 'roster-p7',
      },
      {
        id: 'seg-8',
        order: 3,
        predictedName: 'ナカムラさん（小児）？',
        ...pickRecord('p9'),
        suggestedPatientId: 'roster-p9',
      },
    ],
  },
];
