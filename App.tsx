import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import ButtonLikeIcon from './assets/icons/button-like.svg';
import CalorieRingBase from './assets/icons/calorie-ring-base.svg';
import CalorieRingProgress from './assets/icons/calorie-ring-progress.svg';
import CrownIcon from './assets/icons/crown.svg';
import FireIcon from './assets/icons/fire.svg';
import HeartIcon from './assets/icons/heart.svg';
import HeartRedIcon from './assets/icons/heart-red.svg';
import HomeIcon from './assets/icons/home.svg';
import LikeIcon from './assets/icons/like.svg';
import MealIcon from './assets/icons/meal.svg';
import MealRedIcon from './assets/icons/meal-red.svg';
import SmileIcon from './assets/icons/smile.svg';

type DayMode = 'today' | 'example';

const dayData = {
  example: {
    consumed: 670,
    remaining: 469,
    protein: '92 г',
    mealsCount: 4,
    meals: [
      { title: 'Завтрак', description: 'Овсянка, йогурт', time: '10:50' },
      { title: 'Обед', description: 'Овсянка, йогурт', time: '14:50' },
    ],
  },
  today: {
    consumed: 0,
    remaining: 1139,
    protein: '0 г',
    mealsCount: 0,
    meals: [],
  },
} as const;

const navItems = [
  { id: 'home', label: 'Главное', Icon: HomeIcon },
  { id: 'heart', label: 'Избранное', Icon: HeartIcon },
  { id: 'like', label: 'Оценки', Icon: LikeIcon },
  { id: 'fire', label: 'Цели', Icon: FireIcon },
  { id: 'crown', label: 'Профиль', Icon: CrownIcon },
] as const;

type NavId = (typeof navItems)[number]['id'];

type OverviewScreenData = {
  buttonColor: 'red' | 'blue';
  buttonLabel: string;
  date: string;
  eyebrow: string;
  HeroIcon: typeof CrownIcon;
  heroDescription: string;
  heroLabel: string;
  heroValue: string;
  metrics: readonly [{ value: string; label: string }, { value: string; label: string }];
  rows: readonly { title: string; description: string; status: string }[];
  sectionTitle: string;
  showCalorieRing?: boolean;
  title: string;
};

const overviewScreens: Record<NavId, OverviewScreenData> = {
  home: {
    eyebrow: 'сегодня',
    date: '26 августа',
    title: 'Сводка\nдня',
    HeroIcon: CrownIcon,
    heroLabel: 'Баланс калорий',
    heroValue: '469',
    heroDescription: 'Ккал осталось до\nдневной нормы.',
    metrics: [{ value: '670 ккал', label: 'Съедено' }, { value: '4', label: 'Приема пищи' }],
    sectionTitle: 'Ближайшие действия:',
    rows: [
      { title: 'Завтрак', description: 'Овсянка, йогурт', status: '10:50' },
      { title: 'Вода', description: '5 из 8 стаканов', status: '5/8' },
      { title: 'Прогулка', description: '30 минут', status: '18:30' },
    ],
    buttonLabel: 'Добавить прием',
    buttonColor: 'red',
    showCalorieRing: true,
  },
  heart: {
    eyebrow: 'ваша коллекция',
    date: '24 блюда',
    title: 'Любимые\nблюда',
    HeroIcon: HeartIcon,
    heroLabel: 'Сохранено',
    heroValue: '24',
    heroDescription: 'Блюда, которые вы\nдобавили в избранное.',
    metrics: [{ value: '8', label: 'Завтраков' }, { value: '6', label: 'Быстрых' }],
    sectionTitle: 'Недавно открывали:',
    rows: [
      { title: 'Сырники', description: '360 ккал', status: '12 мин' },
      { title: 'Боул с курицей', description: '510 ккал', status: '20 мин' },
      { title: 'Овсянка', description: '290 ккал', status: '8 мин' },
    ],
    buttonLabel: 'Все блюда',
    buttonColor: 'red',
  },
  like: {
    eyebrow: 'за 30 дней',
    date: '12 оценок',
    title: 'Ваши\nоценки',
    HeroIcon: LikeIcon,
    heroLabel: 'Средняя оценка',
    heroValue: '4,8',
    heroDescription: 'На основе последних\n12 приемов пищи.',
    metrics: [{ value: '9', label: 'Отличных' }, { value: '3', label: 'Хороших' }],
    sectionTitle: 'Последние оценки:',
    rows: [
      { title: 'Завтрак', description: 'Овсянка, ягоды', status: '5/5' },
      { title: 'Обед', description: 'Боул с курицей', status: '4/5' },
      { title: 'Ужин', description: 'Лосось, овощи', status: '5/5' },
    ],
    buttonLabel: 'Все оценки',
    buttonColor: 'blue',
  },
  fire: {
    eyebrow: 'эта неделя',
    date: '26 авг — 1 сен',
    title: 'Ваши\nцели',
    HeroIcon: FireIcon,
    heroLabel: 'Недельный прогресс',
    heroValue: '71%',
    heroDescription: 'Пять дней из семи\nзакрыты по плану.',
    metrics: [{ value: '5 из 7', label: 'Дней в норме' }, { value: '−1,2 кг', label: 'Вес за неделю' }],
    sectionTitle: 'Активные цели:',
    rows: [
      { title: 'Калории', description: '5 из 7 дней', status: '71%' },
      { title: 'Белок', description: '92 из 110 г', status: '84%' },
      { title: 'Вода', description: '5 из 8 стаканов', status: '63%' },
    ],
    buttonLabel: 'Настроить цели',
    buttonColor: 'blue',
  },
  crown: {
    eyebrow: 'ваш профиль',
    date: 'план Баланс',
    title: 'Евгений\nВолков',
    HeroIcon: SmileIcon,
    heroLabel: 'Текущий план',
    heroValue: 'Баланс',
    heroDescription: 'Поддержание веса и\nздоровые привычки.',
    metrics: [{ value: '23', label: 'Дня с нами' }, { value: '7', label: 'Дней подряд' }],
    sectionTitle: 'Настройки:',
    rows: [
      { title: 'Личные данные', description: 'Рост, вес, возраст', status: '›' },
      { title: 'Уведомления', description: 'Напоминания о еде', status: 'Вкл.' },
      { title: 'Единицы', description: 'Ккал, кг, мл', status: '›' },
    ],
    buttonLabel: 'Редактировать',
    buttonColor: 'red',
  },
};

export default function App() {
  const { width: viewportWidth } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(() => {
    if (Platform.OS !== 'web' || typeof globalThis.location === 'undefined') return true;
    const screen = new URLSearchParams(globalThis.location.search).get('screen');
    return screen === null || screen === 'weekly' || screen === 'onboarding';
  });
  const [activeNav, setActiveNav] = useState<NavId>(() => {
    if (Platform.OS !== 'web' || typeof globalThis.location === 'undefined') return 'home';
    const query = globalThis.location.search;
    if (query.includes('screen=favorites')) return 'heart';
    if (query.includes('screen=ratings')) return 'like';
    if (query.includes('screen=goals')) return 'fire';
    if (query.includes('screen=profile') || query.includes('screen=blue')) return 'crown';
    return 'home';
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.querySelector('script[data-figma-capture]')) return;
    const script = document.createElement('script');
    script.src = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
    script.async = true;
    script.dataset.figmaCapture = 'true';
    document.head.appendChild(script);
  }, []);

  if (!fontsLoaded) return <View style={styles.loading} />;

  const completeDay = () => {
    setCelebrationKey((current) => current + 1);
  };

  const gradientColors = isOnboarding
    ? (['#F4E6FF', '#FEFCFF'] as const)
    : (['#F9F1FF', '#FEFCFF'] as const);
  const gradientLocations = isOnboarding
    ? ([0.3063536, 1] as const)
    : ([0, 1] as const);
  const isPhoneWeb = Platform.OS === 'web' && viewportWidth <= 500;

  return (
    <View style={[styles.screen, isPhoneWeb && styles.screenPhoneWeb]}>
      <StatusBar hidden />
      <LinearGradient
        colors={gradientColors}
        locations={gradientLocations}
        style={[styles.frame, isPhoneWeb && styles.framePhoneWeb]}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          key={isOnboarding ? 'onboarding' : 'application'}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.canvas, isPhoneWeb && styles.canvasPhoneWeb]}>
          {isOnboarding ? (
            <Onboarding
              onStart={() => {
                setActiveNav('home');
                setIsOnboarding(false);
              }}
            />
          ) : (
            <FeatureOverview
              data={overviewScreens[activeNav]}
              isPhoneWeb={isPhoneWeb}
              onAvatarPress={() => setIsOnboarding(true)}
              onAction={activeNav === 'home' ? completeDay : undefined}
            />
          )}

          {!isOnboarding && <View accessibilityRole="tablist" style={[styles.navBar, isPhoneWeb && styles.navBarPhoneWeb]}>
            {navItems.map((item) => {
              const selected = activeNav === item.id;
              const Icon = item.Icon;
              return (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  key={item.id}
                  onPress={() => {
                    setActiveNav(item.id);
                    setIsOnboarding(false);
                  }}
                  style={({ pressed }) => [
                    styles.navButton,
                    !selected && styles.navButtonInactive,
                    pressed && styles.navButtonPressed,
                  ]}
                >
                  <Icon height={38} width={38} />
                </Pressable>
              );
            })}
          </View>}
          </View>
        </ScrollView>
        <Celebration burstKey={celebrationKey} />
      </LinearGradient>
    </View>
  );
}

function Onboarding({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.onboarding}>
      <Text style={styles.onboardingEyebrow}>здоровье каждый день</Text>
      <Text style={[styles.onboardingTitle, onboardingTitleGradient]}>{'Ешь лучше.\nЧувствуй больше.'}</Text>
      <View style={styles.onboardingIllustrationViewport}>
        <Image
          resizeMode="contain"
          source={require('./assets/diet-benefit-hero-cutout.png')}
          style={styles.onboardingIllustration}
        />
      </View>
      <Text style={styles.onboardingBody}>
        Сбалансированный рацион помогает сохранить энергию, хорошее настроение и полезные привычки.
      </Text>
      <Pressable
        accessibilityLabel="Начать"
        accessibilityRole="button"
        onPress={onStart}
        style={({ pressed }) => [
          styles.onboardingButton,
          pressed && styles.blueButtonPressed,
        ]}
      >
        <Text style={styles.onboardingButtonText}>Начать</Text>
      </Pressable>
    </View>
  );
}

const onboardingTitleGradient = Platform.select({
  web: {
    backgroundClip: 'text',
    backgroundImage: 'linear-gradient(69.838deg, #E327F4 15.775%, #717CFF 79.047%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any,
  default: { color: '#E327F4' },
});

const celebrationColors = [
  '#E31F1F',
  '#F8A10A',
  '#8134F9',
  '#3570E6',
  '#26B96F',
  '#FF5FA2',
  '#FFD83D',
  '#22C8D8',
];

function Celebration({ burstKey }: { burstKey: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const particles = useMemo(() => Array.from({ length: 84 }, (_, index) => ({
    color: celebrationColors[index % celebrationColors.length],
    delay: 0.01 + (index % 7) * 0.018,
    dx: ((index * 83) % 381) - 190,
    originX: ((index % 3) - 1) * 46,
    rise: 330 + ((index * 53) % 330),
    size: 4 + (index % 5) * 2,
    spin: 240 + (index % 9) * 80,
  })), []);

  useEffect(() => {
    if (burstKey === 0) return;
    progress.stopAnimation();
    progress.setValue(0);
    Animated.timing(progress, {
      duration: 1450,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [burstKey, progress]);

  return (
    <View pointerEvents="none" style={styles.celebrationLayer}>
      {particles.map((particle, index) => (
        <Animated.View
          key={`${index}-${particle.color}`}
          style={[
            styles.celebrationParticle,
            {
              backgroundColor: particle.color,
              borderRadius: index % 3 === 0 ? particle.size / 2 : 1,
              height: particle.size,
              marginLeft: -particle.size / 2,
              width: index % 3 === 0 ? particle.size : particle.size * 0.55,
              opacity: progress.interpolate({
                inputRange: [0, particle.delay, particle.delay + 0.05, 0.8, 1],
                outputRange: [0, 0, 1, 1, 0],
              }),
              transform: [
                { translateX: particle.originX },
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.dx] }) },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, particle.delay, 0.72, 1],
                    outputRange: [0, 0, -particle.rise, -particle.rise + 110],
                  }),
                },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${particle.spin}deg`] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0.3, 1, 0.72] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function FeatureOverview({
  data,
  isPhoneWeb,
  onAvatarPress,
  onAction,
}: {
  data: OverviewScreenData;
  isPhoneWeb: boolean;
  onAvatarPress: () => void;
  onAction?: () => void;
}) {
  const HeroIcon = data.HeroIcon;
  return (
    <>
      <View style={styles.modeRow}>
        <Text style={styles.modeText}>{data.eyebrow}</Text>
        <Text style={styles.modeText}>{data.date}</Text>
      </View>

      <View style={styles.headingRow}>
        <Text style={styles.heading}>{data.title}</Text>
        <Pressable accessibilityLabel="Открыть стартовый экран" hitSlop={8} onPress={onAvatarPress} style={styles.avatar}>
          <Image source={require('./assets/user-avatar.png')} style={styles.avatarImage} />
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        {data.showCalorieRing ? (
          <CalorieDiagram />
        ) : (
          <View style={styles.weeklyBadge}>
            <HeroIcon height={42} width={42} />
          </View>
        )}
        <View style={styles.balanceCopy}>
          <Text style={styles.cardLabel}>{data.heroLabel}</Text>
          <Text style={styles.balanceValue}>{data.heroValue}</Text>
          <Text style={styles.balanceDescription}>{data.heroDescription}</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} value={metric.value} label={metric.label} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>{data.sectionTitle}</Text>
      <View style={styles.mealList}>
        {data.rows.map((row) => <OverviewRow key={row.title} {...row} />)}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => [
          styles.completeButton,
          isPhoneWeb && styles.completeButtonPhoneWeb,
          data.buttonColor === 'blue' && styles.completeButtonBlue,
          pressed && data.buttonColor === 'red' && styles.redButtonPressed,
          pressed && data.buttonColor === 'blue' && styles.blueButtonPressed,
        ]}
      >
        <ButtonLikeIcon height={24} width={24} />
        <Text style={styles.completeText}>{data.buttonLabel}</Text>
      </Pressable>
    </>
  );
}

function CalorieDiagram() {
  return (
    <View style={styles.calorieRing}>
      <CalorieRingBase height={78} style={styles.calorieRingAsset} width={78} />
      <CalorieRingProgress height={78} style={styles.calorieRingAsset} width={78} />
      <View style={styles.calorieValueWrap}>
        <Text style={styles.calorieValue}>670</Text>
        <Text style={styles.calorieUnit}>ккал</Text>
      </View>
    </View>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function MealRow({
  title,
  description,
  time,
  redHeart = false,
}: {
  title: string;
  description: string;
  time: string;
  redHeart?: boolean;
}) {
  const MealHeartIcon = redHeart ? MealRedIcon : MealIcon;

  return (
    <Pressable
      accessibilityLabel={`${title}, ${description}, ${time}`}
      style={({ pressed }) => [styles.mealRow, pressed && styles.mealRowPressed]}
    >
      <MealHeartIcon height={27} style={styles.mealIcon} width={27} />
      <View style={styles.mealCopy}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealDescription}>{description}</Text>
      </View>
      <Text style={styles.mealTime}>{time}</Text>
    </Pressable>
  );
}

function OverviewRow({ title, description, status }: { title: string; description: string; status: string }) {
  return (
    <View style={styles.mealRow}>
      <MealIcon height={27} style={styles.mealIcon} width={27} />
      <View style={styles.mealCopy}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealDescription}>{description}</Text>
      </View>
      <Text style={styles.mealTime}>{status}</Text>
    </View>
  );
}

const shadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#F9F1FF' },
  screen: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    ...(Platform.OS === 'web' ? { paddingVertical: 28 } : null),
  },
  screenPhoneWeb: { backgroundColor: '#F9F1FF', paddingVertical: 0 },
  frame: {
    maxWidth: 393,
    width: '100%',
    ...(Platform.OS === 'web' ? { flexShrink: 0, height: 852 } : { flex: 1 }),
  },
  framePhoneWeb: { flex: 1, height: '100%' },
  scrollContent: { flexGrow: 1 },
  canvas: {
    width: '100%',
    minHeight: 852,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
  },
  canvasPhoneWeb: {
    minHeight: '100dvh',
    paddingTop: 'calc(28px + env(safe-area-inset-top))',
  } as any,
  onboarding: { alignItems: 'center', gap: 60, width: '100%' },
  onboardingEyebrow: { color: '#000000', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 19 },
  onboardingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    width: 315,
  },
  onboardingIllustrationViewport: { height: 275, overflow: 'hidden', width: 297 },
  onboardingIllustration: { height: 275, width: 297 },
  onboardingBody: {
    color: '#595959',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    width: 309,
  },
  onboardingButton: {
    alignItems: 'center',
    backgroundColor: '#3570E6',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 196,
  },
  onboardingButtonText: { color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 18 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  modeText: { color: '#000000', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 19 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18 },
  heading: { color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34 },
  avatar: { alignItems: 'center', justifyContent: 'center', height: 49, marginTop: 5, width: 49 },
  avatarImage: { borderRadius: 24.5, height: 49, width: 49 },
  balanceCard: {
    ...shadow,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    height: 160,
    marginTop: 39,
    paddingLeft: 24,
  },
  calorieRing: { alignItems: 'center', height: 78, justifyContent: 'center', width: 78 },
  calorieRingAsset: { height: 78, position: 'absolute', transform: [{ scaleY: -1 }], width: 78 },
  weeklyBadge: { alignItems: 'center', backgroundColor: '#F2E8FF', borderRadius: 39, height: 78, justifyContent: 'center', width: 78 },
  calorieValueWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 2 },
  calorieValue: { color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 22 },
  calorieUnit: { color: '#868686', fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 11 },
  balanceCopy: { marginLeft: 36, marginTop: -1 },
  cardLabel: { color: '#000000', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 19 },
  balanceValue: { color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, marginTop: 1 },
  balanceDescription: { color: '#868686', fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 16, marginTop: 1 },
  metricRow: { flexDirection: 'row', gap: 19, marginTop: 17 },
  metricCard: {
    ...shadow,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flex: 1,
    height: 82,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  metricValue: { color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 24 },
  metricLabel: { color: '#000000', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 19, marginTop: 4 },
  sectionTitle: { color: '#000000', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 19, marginTop: 36 },
  mealList: { marginTop: 17 },
  mealRow: { alignItems: 'center', borderBottomColor: 'rgba(129,52,249,0.10)', borderBottomWidth: 1.2, flexDirection: 'row', height: 64 },
  mealRowPressed: { backgroundColor: 'rgba(129,52,249,0.04)' },
  mealIcon: { height: 27, marginLeft: 3, width: 27 },
  mealCopy: { marginLeft: 8 },
  mealTitle: { color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 19 },
  mealDescription: { color: 'rgba(0,0,0,0.50)', fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 16, marginTop: 1 },
  mealTime: { color: 'rgba(0,0,0,0.50)', fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 16, marginLeft: 'auto', marginRight: 4 },
  emptyText: { color: '#868686', fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, marginTop: 16 },
  completeButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E22020',
    borderRadius: 12,
    bottom: 91,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 30,
    position: 'absolute',
  },
  completeButtonBlue: { backgroundColor: '#3366E5' },
  completeButtonPhoneWeb: {
    bottom: 'calc(91px + env(safe-area-inset-bottom))',
  } as any,
  redButtonPressed: { backgroundColor: '#EA4A4A', transform: [{ scale: 0.98 }] },
  blueButtonPressed: { backgroundColor: '#5B8DEF', transform: [{ scale: 0.98 }] },
  completeText: { color: '#FFFFFF', fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 18, marginLeft: 10 },
  celebrationLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', zIndex: 10 },
  celebrationParticle: { left: 196.5, position: 'absolute', top: 739 },
  navBar: { alignItems: 'center', bottom: 24, flexDirection: 'row', justifyContent: 'space-between', left: 28, position: 'absolute', right: 28 },
  navBarPhoneWeb: {
    bottom: 'calc(24px + env(safe-area-inset-bottom))',
  } as any,
  navButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  navButtonInactive: { opacity: 0.67 },
  navButtonPressed: { transform: [{ scale: 0.94 }] },
});
