import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Journal: { assignmentId?: string; studentId?: string } | undefined;
  Agenda: undefined;
  Assistant: undefined;
  Profile: undefined;
};

export type SubjectTab = 'ringkasan' | 'siswa' | 'nilai' | 'rapor' | 'kelompok';
export type HomeroomTab = 'ringkasan' | 'tinjauan' | 'nilai' | 'siswa' | 'mapel';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Setup: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  ManageRoles: undefined;
  SubjectClass: { assignmentId: string; tab?: SubjectTab };
  Homeroom: { classId: string; tab?: HomeroomTab };
  Student: { studentId: string; assignmentId?: string };
  Report: { assignmentId: string; studentId: string; periode: string };
  StudentForm: { classId: string; studentId?: string };
  AdminDashboard: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
