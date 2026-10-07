import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const initialGrades = [
  { id: '1', studentName: 'Ayu Pratama', subject: 'Math', grade: 92 },
  { id: '2', studentName: 'Budi Saputra', subject: 'Science', grade: 84 },
  { id: '3', studentName: 'Citra Lestari', subject: 'English', grade: 88 },
];

function DashboardScreen({ grades }) {
  const stats = useMemo(() => {
    const totalStudents = grades.length;
    const averageGrade =
      totalStudents === 0
        ? 0
        : Math.round(grades.reduce((sum, item) => sum + item.grade, 0) / totalStudents);
    const passingCount = grades.filter((item) => item.grade >= 75).length;

    return {
      totalStudents,
      averageGrade,
      passingRate: totalStudents === 0 ? 0 : Math.round((passingCount / totalStudents) * 100),
    };
  }, [grades]);

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>PenaGuru Dashboard</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Average Grade" value={stats.averageGrade} />
        <StatCard label="Passing Rate" value={`${stats.passingRate}%`} />
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GradesScreen({ grades, onAddGrade }) {
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const parsedGrade = Number(grade);

    if (!studentName.trim() || !subject.trim() || Number.isNaN(parsedGrade)) {
      setError('Please fill all fields with valid values.');
      return;
    }

    if (parsedGrade < 0 || parsedGrade > 100) {
      setError('Grade must be between 0 and 100.');
      return;
    }

    onAddGrade({
      studentName: studentName.trim(),
      subject: subject.trim(),
      grade: parsedGrade,
    });

    setStudentName('');
    setSubject('');
    setGrade('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Student Grades</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add Grade</Text>
          <TextInput
            value={studentName}
            onChangeText={setStudentName}
            placeholder="Student name"
            style={styles.input}
          />
          <TextInput value={subject} onChangeText={setSubject} placeholder="Subject" style={styles.input} />
          <TextInput
            value={grade}
            onChangeText={setGrade}
            placeholder="Grade (0-100)"
            keyboardType="numeric"
            style={styles.input}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save Grade</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Grade List</Text>
        <FlatList
          data={grades}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View>
                <Text style={styles.listName}>{item.studentName}</Text>
                <Text style={styles.listMeta}>{item.subject}</Text>
              </View>
              <Text style={styles.gradePill}>{item.grade}</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportCardsScreen({ grades }) {
  const reportData = useMemo(() => {
    const grouped = grades.reduce((acc, entry) => {
      if (!acc[entry.studentName]) {
        acc[entry.studentName] = [];
      }
      acc[entry.studentName].push(entry);
      return acc;
    }, {});

    return Object.entries(grouped).map(([studentName, records]) => {
      const average = Math.round(records.reduce((sum, item) => sum + item.grade, 0) / records.length);
      return {
        studentName,
        average,
        records,
      };
    });
  }, [grades]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <Text style={styles.title}>Report Cards</Text>
        {reportData.map((report) => (
          <View key={report.studentName} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.listName}>{report.studentName}</Text>
              <Text style={styles.gradePill}>Avg: {report.average}</Text>
            </View>
            {report.records.map((record) => (
              <View key={`${record.id}-subject`} style={styles.reportRow}>
                <Text style={styles.listMeta}>{record.subject}</Text>
                <Text style={styles.listMeta}>{record.grade}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [grades, setGrades] = useState(initialGrades);

  const addGrade = ({ studentName, subject, grade }) => {
    setGrades((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        studentName,
        subject,
        grade,
      },
    ]);
  };

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Dashboard">{() => <DashboardScreen grades={grades} />}</Tab.Screen>
        <Tab.Screen name="Grades">{() => <GradesScreen grades={grades} onAddGrade={addGrade} />}</Tab.Screen>
        <Tab.Screen name="Report Cards">{() => <ReportCardsScreen grades={grades} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4f46e5',
  },
  statLabel: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listMeta: {
    color: '#6b7280',
    marginTop: 2,
  },
  gradePill: {
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
});
