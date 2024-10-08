import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Images from '../../constants/images';
import Send from '../../../assets/images/send.svg';
import Clip from '../../../assets/images/clip.svg';
import Fonts from '../../constants/fonts';
import colors from '../../constants/colors';
import CustomBtn from '../../components/CustomBtn';
import YesNoDialog from '../../components/YesNoDialog/YesNoDialog';
import {RootStackParamList, DiaryData} from '../../types/diary.type';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {makeApiRequest} from '../../utils/api';
import {useRecoilValue} from 'recoil';
import {tokenState} from '../../atoms/authAtom';
import CustomCloseModal from '../../components/CustomCloseModal';

type MyDiaryRouteProp = RouteProp<RootStackParamList, 'MyDiary'>;
type MyDiaryNavigationProp = StackNavigationProp<RootStackParamList, 'MyDiary'>;

type Props = {
  route: MyDiaryRouteProp;
  navigation: MyDiaryNavigationProp;
};

const MyDiary: React.FC<Props> = ({route, navigation}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [diaryData, setDiaryData] = useState<DiaryData | null>(null);
  const [emotionId, setEmotionId] = useState<number | undefined>(undefined);

  const diaryId = route.params.diaryId;

  // 접근 토큰
  const {accessToken} = useRecoilValue(tokenState);

  // 일기 데이터 불러오기
  const fetchDiaryData = async () => {
    if (!diaryId) {
      Alert.alert('오류', 'diaryId가 전달되지 않았습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await makeApiRequest(
        'GET',
        `/diaries/${diaryId}`,
        undefined,
        'application/json',
        accessToken || undefined,
      );

      if (response.status === 200 && response.data.data) {
        setDiaryData(response.data.data);

        const emotionResponse = await makeApiRequest(
          'GET',
          `/diaries/self-emotions/${response.data.data.emotionId}`,
          undefined,
          'application/json',
          accessToken || undefined,
        );

        if (emotionResponse.status === 200 && emotionResponse.data.data) {
          setEmotionId(emotionResponse.data.data.emotionId);
        } else {
          throw new Error(
            emotionResponse.data.errorMessage ||
              '감정 데이터를 불러올 수 없습니다.',
          );
        }
      } else {
        throw new Error(
          response.data.errorMessage || '일기 데이터를 불러올 수 없습니다.',
        );
      }
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '일기 데이터를 가져오는 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryId, accessToken]);

  const handleDelete = async () => {
    if (!diaryId) {
      Alert.alert('오류', 'diaryId가 없습니다.');
      return;
    }

    try {
      const response = await makeApiRequest(
        'DELETE',
        `/diaries/${diaryId}`,
        undefined,
        'application/json',
        accessToken || undefined,
      );

      if (response.status === 200) {
        Alert.alert('일기 삭제', '일기가 성공적으로 삭제되었습니다.', [
          {
            text: '확인',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{name: 'DiaryEmotion'}],
              }),
          },
        ]);
      } else {
        Alert.alert(
          '삭제 실패',
          response.data.errorMessage || '일기 삭제에 실패했습니다.',
        );
      }
    } catch (error: any) {
      Alert.alert('삭제 실패', '일기 삭제에 실패했습니다.');
    }
  };

  const handleEditPress = () => {
    setEditModalVisible(true);
  };

  const handleCommunityPost = async () => {
    try {
      const response = await makeApiRequest(
        'POST',
        `/public-diaries?personalDiaryId=${diaryId}`,
        undefined,
        'application/json',
        accessToken || undefined,
      );

      if (response.status === 201) {
        Alert.alert('게시 완료', '일기가 커뮤니티에 게시되었습니다.');
        setModalVisible(false); // 모달 닫기
      } else {
        Alert.alert(
          '게시 실패',
          response.data.errorMessage || '커뮤니티 게시에 실패했습니다.',
        );
      }
    } catch (error: any) {
      Alert.alert('게시 실패', '커뮤니티 게시에 실패했습니다.');
    }
  };

  const goBack = () => navigation.goBack();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (!diaryData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>일기 데이터를 불러올 수 없습니다.</Text>
        <CustomBtn text="뒤로가기" onPress={goBack} type="SECONDARY" />
      </View>
    );
  }

  const diaryDate = new Date(diaryData.date);
  const year = diaryDate.getFullYear();
  const month = diaryDate.getMonth() + 1;
  const day = diaryDate.getDate();
  const hours = diaryDate.getHours();
  const minutes = diaryDate.getMinutes();

  return (
    <ImageBackground
      style={{flex: 1}}
      resizeMode={'cover'}
      source={Images.backgroundImage}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CustomBtn onPress={handleEditPress} text="수정" type="SMALL" />
          <CustomBtn onPress={handleDelete} text="삭제" type="SMALL" />
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Send />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <YesNoDialog
          visible={modalVisible}
          message="커뮤니티에 게시하시겠습니까?"
          yesText="네"
          noText="아니요"
          yesCallback={handleCommunityPost}
          noCallback={() => setModalVisible(false)}
        />
        <CustomCloseModal
          visible={editModalVisible}
          title="감정을 수정하시겠습니까? 또는 일기를 수정하시겠습니까?"
          onClose={() => setEditModalVisible(false)}
          onYes={() => {
            navigation.navigate('DiaryEmotion', {
              diaryId: diaryId,
              emotionId: emotionId,
            });
          }}
          onNo={() => {
            navigation.navigate('Dailys', {diaryId: diaryId});
          }}
        />
        <View style={styles.container}>
          <Text style={styles.title}>
            {year}년 {month}월 {day}일
          </Text>
          {(hours !== 0 || minutes !== 0) && (
            <Text style={styles.time}>
              {hours}시 {minutes}분
            </Text>
          )}
          <View style={styles.contents}>
            {diaryData.photoUrl && (
              <Image source={{uri: diaryData.photoUrl}} style={styles.image} />
            )}
            <View style={styles.clip}>
              <Clip />
            </View>
            <Text style={styles.diaryTitle}>{diaryData.title}</Text>
            <Text style={styles.diaryData}>{diaryData.content}</Text>
          </View>
          <CustomBtn
            text="분석보기"
            onPress={() =>
              navigation.navigate('DailyAnalyze', {
                diaryId: diaryId,
                emotionId: diaryData.emotionId,
              })
            }
            type="SECONDARY"
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 40,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: Fonts.MapoFont,
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  contents: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  clip: {
    position: 'absolute',
    top: -20,
    right: '50%',
    transform: [{translateX: -14}],
  },
  title: {
    fontFamily: Fonts.MapoFont,
    fontSize: 20,
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  time: {
    fontFamily: Fonts.MapoFont,
    fontSize: 12,
    color: colors.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  diaryTitle: {
    fontFamily: Fonts.MapoFont,
    fontSize: 22,
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  diaryData: {
    fontFamily: Fonts.MapoFont,
    fontSize: 16,
    color: colors.black,
    textAlign: 'left',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.MapoFont,
    fontSize: 16,
    marginTop: 10,
    color: '#0000ff',
  },
});

export default MyDiary;
