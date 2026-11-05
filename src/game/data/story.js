/**
 * Сюжет: персонажи и катсцены. Только данные, показывает их StoryScene + ui/storyUi.js.
 *
 * Катсцена — список кадров. Кадр:
 *   bg    — фон: 'farm' | 'forest' | 'battle' (если нет — как в прошлом кадре);
 *   mood  — освещение: 'dark' (почти темно), 'night', 'dawn' или нет (день);
 *   flash — зелёная вспышка в начале кадра;
 *   cast  — кто в кадре: { персонаж: [x, анимация, куда смотрит (1 вправо, -1 влево)] };
 *           x в игровых единицах экрана 390 шириной, кого нет в списке — уходит из кадра;
 *   say   — кто говорит (персонаж) или null для надписи без говорящего;
 *   text  — реплика, не длиннее двух строк на телефоне.
 * Анимации: idle, attack, strike, hurt, victory, defeat, sleep.
 *
 * Когда показывается: 'intro' — после «Играть» при первом запуске,
 * 'chN_before' — перед первым боем главы N, 'chN_after' — после первой победы в главе N.
 */

export const ACTORS = {
  tosha:    { name: 'Тоша',              skin: 'tosha',     scale: 0.62 },
  gruzd:    { name: 'Дед Груздь',        skin: 'gruzd',     scale: 0.74 },
  mukha:    { name: 'Муха',              skin: 'mukhomor',  scale: 0.64 },
  veshenka: { name: 'Вешенка',           skin: 'veshenka',  scale: 0.64 },
  smorchok: { name: 'Генерал Сморчок',   skin: 'smorchok',  scale: 0.8 },
  witch:    { name: 'Ведьма Светлячиха', skin: 'witch',     scale: 0.92 },
  witchOff: { name: 'Ведьма',            skin: 'witch',     scale: 0.5 },
  svet1:    { name: 'Светляк',           skin: 'm_openok',  scale: 0.6 },
  svet2:    { name: 'Светляк',           skin: 'm_podberez', scale: 0.6 },
  svetBor:  { name: 'Светляк-боровик',   skin: 'm_borovik', scale: 0.6 },
  svetMukh: { name: 'Светляк-мухомор',   skin: 'm_mukhomor', scale: 0.6 },
  // Светляки, погасшие в финале: снова обычные грибы
  exSvet1:  { name: 'Опёнок',            skin: 'openok',    scale: 0.6 },
  exSvet2:  { name: 'Подберёзовик',      skin: 'podberez',  scale: 0.6 },
};

export const STORY = {
  intro: [
    { bg: 'farm', mood: 'dark', flash: true, cast: {}, say: 'gruzd', text: 'Давно это было. Над лесом как бабахнет…' },
    { mood: 'dark', cast: { gruzd: [195, 'idle', 1] }, say: 'gruzd', text: 'Люди ушли, забор поставили, а мы, грибы, остались. И проснулись.' },
    { cast: { gruzd: [110, 'idle', 1] }, say: 'gruzd', text: 'А вместе с нами полезли из земли кристаллы. Кто их растит, тот и сыт, и силён.' },
    { mood: 'night', cast: { svet1: [250, 'attack', -1], svet2: [330, 'attack', -1] }, say: 'gruzd', text: 'Да только не все растить хотят. Светляки привыкли отнимать.' },
    { cast: { gruzd: [90, 'idle', 1], tosha: [240, 'hurt', -1] }, say: 'tosha', text: 'Дед! Опять всё утащили! Я им сейчас как…' },
    { cast: { gruzd: [90, 'idle', 1], tosha: [240, 'idle', -1] }, say: 'gruzd', text: 'Не горячись, Тошка. Один гриб — не грибница. Собери отряд и вырасти новые кристаллы.' },
    { cast: { gruzd: [90, 'idle', 1], tosha: [240, 'victory', -1] }, say: 'tosha', text: 'А потом?' },
    { cast: { gruzd: [90, 'victory', 1], tosha: [240, 'victory', -1] }, say: 'gruzd', text: 'А потом пойдём забирать своё. До самой Вышки.' },
  ],

  ch1_before: [
    { bg: 'forest', cast: { tosha: [90, 'idle', 1], svet1: [260, 'victory', -1], svet2: [330, 'idle', -1] }, say: 'svet1', text: 'Гля, мелкий припёрся. Иди поливай свои грядки.' },
    { cast: { tosha: [90, 'attack', 1], svet1: [260, 'idle', -1], svet2: [330, 'idle', -1] }, say: 'tosha', text: 'Это наши кристаллы! Отдавайте по-хорошему!' },
    { cast: { gruzd: [60, 'idle', 1], tosha: [140, 'idle', 1], svet1: [260, 'idle', -1], svet2: [330, 'idle', -1] }, say: 'gruzd', text: 'Помни, Вася… тьфу, Тоша: Земля бьёт Яд, Яд бьёт Дерево, Дерево бьёт Землю.' },
  ],

  ch2_after: [
    { bg: 'forest', cast: { tosha: [100, 'idle', 1], veshenka: [270, 'defeat', -1] }, say: 'veshenka', text: 'Спасибо… Светляки держали меня у забора и заставляли драться за них.' },
    { cast: { tosha: [100, 'idle', 1], veshenka: [270, 'idle', -1] }, say: 'tosha', text: 'Пойдёшь с нами? Нам нужен тот, кто умеет лечить.' },
    { cast: { tosha: [90, 'idle', 1], mukha: [170, 'victory', 1], veshenka: [280, 'idle', -1] }, say: 'veshenka', text: 'Пойду. Только… можно мы не будем ходить в темноте?' },
    { cast: { tosha: [90, 'idle', 1], mukha: [170, 'victory', 1], veshenka: [280, 'hurt', -1] }, say: 'mukha', text: 'Ничего не обещаем!' },
  ],

  ch3_before: [
    { bg: 'forest', cast: { tosha: [120, 'victory', 1], mukha: [250, 'idle', -1] }, say: 'tosha', text: 'Трое на трое! Да я их одной левой!' },
    { cast: { tosha: [120, 'idle', 1], mukha: [250, 'victory', -1] }, say: 'mukha', text: 'У тебя левая тоньше спички, Тошка.' },
    { cast: { tosha: [100, 'idle', 1], mukha: [190, 'idle', 1], gruzd: [310, 'idle', -1] }, say: 'gruzd', text: 'Хвалёный гриб первым в корзину попадает. Держитесь вместе.' },
  ],

  ch4_after: [
    { bg: 'forest', mood: 'night', cast: { tosha: [110, 'idle', 1], svetBor: [270, 'defeat', -1] }, say: 'svetBor', text: 'Ты… ты такой же, как я. Только не светишься.' },
    { mood: 'night', cast: { tosha: [150, 'idle', -1], gruzd: [60, 'idle', 1], svetBor: [300, 'idle', -1] }, say: 'tosha', text: 'Дед, они ведь тоже грибы. Почему они такие?' },
    { mood: 'night', cast: { tosha: [150, 'idle', -1], gruzd: [60, 'idle', 1] }, say: 'gruzd', text: 'Кто долго у Вышки рос, тот её светом и думает. Не со зла это, Тошка. Со света.' },
  ],

  ch5_before: [
    { bg: 'battle', cast: { smorchok: [270, 'victory', -1] }, say: 'smorchok', text: 'Стоять! Смир-рно! Кто разрешил ходить по территории Светляков?' },
    { cast: { tosha: [100, 'idle', 1], smorchok: [280, 'idle', -1] }, say: 'tosha', text: 'Это наша земля, генерал. Возвращайте кристаллы.' },
    { cast: { tosha: [100, 'idle', 1], smorchok: [300, 'attack', -1] }, say: 'smorchok', text: 'Отряд, в атаку! А я… я покомандую отсюда.' },
  ],

  ch5_after: [
    { bg: 'battle', cast: { smorchok: [270, 'defeat', -1] }, say: 'smorchok', text: 'Это был тактический отход! Очень тактический!' },
    { cast: { mukha: [110, 'victory', 1], smorchok: [280, 'idle', -1] }, say: 'mukha', text: 'Ага, лёжа. Зачем вам столько кристаллов, генерал?' },
    { mood: 'night', cast: { mukha: [110, 'idle', 1], smorchok: [280, 'idle', -1] }, say: 'smorchok', text: 'Ведьма велит. Соберёт гору на Вышке и устроит Вторую Вспышку. Все засветятся!' },
    { cast: { tosha: [120, 'hurt', 1], gruzd: [260, 'idle', -1] }, say: 'tosha', text: 'Дед, это же всю Зону накроет…' },
    { cast: { tosha: [120, 'idle', 1], gruzd: [260, 'attack', -1] }, say: 'gruzd', text: 'Значит, не успеет. Шагаем, отряд.' },
  ],

  ch6_before: [
    { bg: 'forest', mood: 'dawn', cast: { gruzd: [195, 'idle', 1] }, say: 'gruzd', text: 'Ох… Я ведь тут вырос. Вот у того колодца.' },
    { mood: 'dark', flash: true, cast: { gruzd: [195, 'idle', 1] }, say: 'gruzd', text: 'Когда бабахнуло, всё стало зелёным. Кто ближе к свету был, так и не погас.' },
    { mood: 'dawn', cast: { gruzd: [110, 'idle', 1], tosha: [270, 'idle', -1] }, say: 'tosha', text: 'Мы их погасим, дед. По-доброму.' },
    { mood: 'dawn', cast: { gruzd: [80, 'idle', 1], tosha: [210, 'idle', -1], mukha: [310, 'victory', -1] }, say: 'mukha', text: 'Сначала по-доброму, потом по шляпке.' },
  ],

  ch7_after: [
    { bg: 'battle', cast: { mukha: [110, 'idle', 1], svetMukh: [280, 'defeat', -1] }, say: 'svetMukh', text: 'Муха? Сестрёнка, это ты?' },
    { cast: { mukha: [110, 'hurt', 1], svetMukh: [280, 'idle', -1] }, say: 'mukha', text: 'Мухоморчик?! Ты светишься… и у тебя глаз на шляпке!' },
    { cast: { tosha: [70, 'idle', 1], mukha: [150, 'idle', 1], svetMukh: [290, 'idle', -1] }, say: 'tosha', text: 'Отпустим их. Пусть идут домой, а не к Вышке.' },
    { cast: { tosha: [70, 'idle', 1], mukha: [150, 'victory', 1], svetMukh: [300, 'victory', -1] }, say: 'svetMukh', text: 'Спасибо… Я найду тебя, когда погаснет свет.' },
  ],

  ch8_before: [
    { bg: 'battle', mood: 'night', cast: { gruzd: [110, 'idle', 1], tosha: [270, 'idle', -1] }, say: 'gruzd', text: 'Дальше я не пойду, ножки уже не те. Буду сторожить дорогу назад.' },
    { mood: 'night', cast: { gruzd: [110, 'idle', 1], tosha: [270, 'hurt', -1] }, say: 'tosha', text: 'Дед…' },
    { mood: 'night', cast: { gruzd: [110, 'victory', 1], tosha: [270, 'idle', -1] }, say: 'gruzd', text: 'Иди, Тошка. Одна сыроежка лета не делает, а вы — отряд.' },
    { mood: 'night', cast: { tosha: [90, 'idle', 1], mukha: [190, 'victory', 1], veshenka: [290, 'idle', 1] }, say: 'mukha', text: 'Последняя стража. Покажем им, кто тут грибница!' },
  ],

  ch9_before: [
    { bg: 'battle', mood: 'night', flash: true, cast: { witch: [280, 'victory', -1] }, say: 'witch', text: 'Какие гости. Маленький боровичок пришёл спасать лес.' },
    { mood: 'night', cast: { tosha: [90, 'attack', 1], witch: [290, 'idle', -1] }, say: 'tosha', text: 'Пришёл забрать своё. И не дать тебе бабахнуть ещё раз.' },
    { mood: 'night', cast: { tosha: [90, 'idle', 1], witch: [290, 'attack', -1] }, say: 'witch', text: 'Глупый. После Вспышки ты стал бы сильнее всех. Ну что ж, светись или вались!' },
  ],

  ch9_after: [
    { bg: 'battle', mood: 'night', flash: true, cast: { tosha: [100, 'strike', 1], witch: [290, 'hurt', -1] }, say: 'witch', text: 'Нет! Это же моё сияние!' },
    { mood: 'dawn', cast: { tosha: [100, 'idle', 1], witchOff: [290, 'defeat', -1] }, say: 'witchOff', text: 'Ой… а что это я тут делаю?' },
    { mood: 'dawn', cast: { gruzd: [70, 'idle', 1], tosha: [170, 'victory', 1], exSvet1: [290, 'idle', -1], exSvet2: [350, 'idle', -1] }, say: 'gruzd', text: 'Вот и всё. Земли тут на всех хватит, если растить, а не отнимать.' },
    { mood: 'dawn', cast: { gruzd: [70, 'idle', 1], tosha: [170, 'idle', 1], exSvet1: [290, 'victory', -1], exSvet2: [350, 'victory', -1] }, say: 'tosha', text: 'Дед… а давай они тоже грядки вскопают?' },
    { mood: 'dawn', cast: { gruzd: [70, 'victory', 1], tosha: [170, 'victory', 1], mukha: [260, 'victory', -1], veshenka: [340, 'victory', -1] }, say: 'gruzd', text: 'Вот теперь ты грибница, Тошка.' },
    { mood: 'dawn', cast: { gruzd: [70, 'victory', 1], tosha: [170, 'victory', 1], mukha: [260, 'victory', -1], veshenka: [340, 'victory', -1] }, say: null, text: 'Зона свободна. Но грядки сами себя не польют.' },
  ],
};

/** Музыка катсцены: по фону первого кадра. */
export const STORY_MUSIC = { farm: 'farm', forest: 'forest', battle: 'battle' };
