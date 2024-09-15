import React from 'react';

import {RootStackParamList} from '../types/diary.type';
import {createStackNavigator} from '@react-navigation/stack';
import DiaryEmotion from './Diary/DiaryEmotion';
import DailyDiary from './Diary/DailyDiary';
import MyDiary from './Diary/MyDiary';
import DailyAnalyze from './Diary/DailyAnalyze';
import { useNavigation } from '@react-navigation/native';

const DiaryPage: React.FC = () => {
  const Stack = createStackNavigator<RootStackParamList>();



  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="DiaryEmotion">
      <Stack.Screen name="DiaryEmotion" component={DiaryEmotion} />
      <Stack.Screen name="DailyDiary" component={DailyDiary} />
      <Stack.Screen name="MyDiary" component={MyDiary} />
      <Stack.Screen name="DailyAnalyze" component={DailyAnalyze} />
    </Stack.Navigator>
  );
};

export default DiaryPage;
