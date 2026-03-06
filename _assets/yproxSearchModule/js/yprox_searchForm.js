/**
 *
 *   @author abilive
 *   @file yprox_searchForm.js
 *   @version 1.0.1
 *   @requires dayjs-1.11.7 (MIT License)
 *   @requires flatpickr-4.6.9 (MIT License)
 *
 *   @hitory
 *   2023.12.07 一部android端末にてカレンダーが表示されない不具合を修正
 *   2023.12.25 チェックイン日だけを選択して検索された場合に、泊数初期値で検索されるように修正
 *   2023.12.25 チェックイン日を指定した時に、チェックアウト日を選択するような案内文を追加
 *   2024.06.07 英語の人数・客室選択のテキストを修正
 *   2024.06.12 カレンダーの表示位置を自動で上下に調整するための処理を追加
 *   2025.12.23 言語強制設定の追加
 *
 */

// リサイズ用のタイマー変数
let yprox_wr_queue = null;
let yprox_wr_currentWidth = window.innerWidth;
let yprox_wr_currentHeight = window.innerHeight;
// チェックアウト日の案内文用の変数
let textCheckInnOut = '';
let flagCalendarHideCheckOutText = false;
/**
* 言語強制設定
* null: ブラウザの言語設定を使用（デフォルト）
* "en": 英語に強制
* "ja": 日本語に強制
* "ko": 韓国語に強制
* "zh-CN": 中国語簡体字に強制
* "zh-TW": 中国語繁体字に強制
*/
const FORCE_LANGUAGE = null;

/**
 * DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function () {
	const nInitDay = 1;		// 日付(○日後) ※本日の場合は 0
	const nInitPer = 2;		// 人数
	const nInitStay = 1;		// 泊数
	const nInitRoom = 1;		// 部屋数

	const nOpMaxYear = 2;			// 日付(今年も含めて何年分表示するか)
	const nOpMaxPer = 2;		// 人数(最大選択値)
	const nOpMaxNights = 10;		// 泊数(最大選択値)
	const nOpMaxRoom = 3;		// 部屋数(最大選択値)

	let flagNoDate = false;		// 初期表示日付(日付なし)の場合は true 、formタグへ data-no-date を付与で日付なし

	let flagCalendar = false;   // カレンダーを表示する場合は true 、formタグへ data-calendar を付与でカレンダー表示
	flagCalendarHideCheckOutText = false; // チェックアウト日を選択するような案内文を非表示にする場合は true 、formタグへ data-hide-checkout-text を付与で非表示

	const windowMobileWidth = 767; //モバイルの画面幅

	const nInitCalendar = 2; //カレンダーの月の表示数
	const nInitCalendarMobile = 1; //windowMobileWidth以下の画面幅でのカレンダーの月の表示数

	const calendarSpanStr = ' - '; //カレンダーの日付の間に入れる文字 初期表示にしたい場合は null

	const wr_wait = 600; // リサイズイベント発生時の待ち時間
	// チェックアウト日を指定した時に、チェックアウト日を選択するような案内文
	const textCheckInnOutJP = `続けてチェックアウト日を<br>選択してください`;
	const textCheckInnOutEN = `Please select your check-out date`;
	const textCheckInnOutKR = `체크아웃 날짜를<br>선택해 주세요`;
	const textCheckInnOutCN = `請選擇退房日期`;
	const textCheckInnOutTW = `請選擇退房日期`;
	textCheckInnOut = textCheckInnOutEN;

	/**
	 * 日付計算用のscriptのパス
	 * CDNをご希望の場合は以下のパスをご利用ください
	 * https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js
	 */
	const dayjsPath = '/_assets/yproxSearchModule/js/dayjs.min.js'; //日付計算用のscriptのパス
	/**
	 * カレンダー用cssのパス
	 * CDNをご希望の場合は以下のパスをご利用ください
	 * https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css
	 */
	const calendarCss = '/_assets/yproxSearchModule/css/flatpickr.min.css';
	/**
	 * カレンダー用jsのパス
	 * CDNをご希望の場合は以下のパスをご利用ください
	 * https://cdn.jsdelivr.net/npm/flatpickr
	 */
	const calendarJs = '/_assets/yproxSearchModule/js/flatpickr.js';
	/**
	 * カレンダー用の言語ファイルのパス
	 * CDNをご希望の場合は以下のパスをご利用ください
	 * ※ブラウザの言語設定によって表示される言語が変わります
	 * https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js
	 * https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ko.js
	 * https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/zh.js
	 * https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/zh-tw.js
	 */
	const calendarLangJa = '/_assets/yproxSearchModule/js/l10n/ja.js'; //カレンダー用の言語ファイルのパス
	const calendarLangKo = '/_assets/yproxSearchModule/js/l10n/ko.js'; //韓国語
	const calendarLangZh = '/_assets/yproxSearchModule/js/l10n/zh.js'; //中国語(簡体字)
	const calendarLangZh_TW = '/_assets/yproxSearchModule/js/l10n/zh-tw.js'; //中国語(繁体字)

	const dayjsJa = '/_assets/yproxSearchModule/js/locale/ja.js'; //カレンダー用の言語ファイルのパス
	const dayjsKo = '/_assets/yproxSearchModule/js/locale/ko.js'; //韓国語
	const dayjsZh = '/_assets/yproxSearchModule/js/locale/zh-cn.js'; //中国語(簡体字)
	const dayjsTW = '/_assets/yproxSearchModule/js/locale/zh-tw.js'; //中国語(繁体字)

	//日付計算用のscriptを読み込む
	const scriptDayjs = document.createElement('script'); //script要素を作成
	document.head.appendChild(scriptDayjs); //head要素にscript要素を追加
	//日付計算用のscriptの読み込み完了
	scriptDayjs.onload = function () {
		//カレンダーを表示が有効に設定してあればscriptを読み込む
		const Body = document.body; // body
		const searchForm = Body.querySelectorAll('.js-yprox-searchForm'); // search form
		const lenSearchForm = searchForm.length; // formの数
		// formの数だけループ
		for (let i = 0; i < lenSearchForm; i++) {
			const form = searchForm[i]; // form
			if (!flagCalendar) {
				flagCalendar = form.getAttribute('data-calendar') === '' ? true : false; //カレンダーを表示するかどうか
				flagCalendarHideCheckOutText = form.getAttribute('data-hide-checkout-text') === '' ? true : false; //カレンダーを表示するかどうか
			}
		}
		//カレンダーを表示する場合はscriptを読み込む
		if (flagCalendar) {
			//cssを読み込む
			const link = document.createElement('link'); //link要素を作成
			link.rel = 'stylesheet'; //rel属性をstylesheetに
			document.head.appendChild(link); //head要素にlink要素を追加
			//cssの読み込みが完了したらscriptを読み込む
			link.onload = function () {
				//scriptを読み込む
				let userLanguage = FORCE_LANGUAGE || navigator.language; //言語を取得
				if (String(userLanguage).indexOf('ja') != -1 || String(userLanguage).indexOf('ja-JP') != -1 || String(userLanguage).indexOf('zh-CN') != -1 || String(userLanguage).indexOf('ko') != -1 || String(userLanguage).indexOf('ko-KR') != -1 || String(userLanguage).indexOf('zh-TW') != -1) {
					//英語以外の場合
					const script = document.createElement('script'); //script要素を作成
					const scriptDayjs = document.createElement('script'); //script要素を作成
					document.head.appendChild(script); //head要素にscript要素を追加
					document.head.appendChild(scriptDayjs);
					//言語ファイルの読み込み完了
					script.onload = function () {
						const script2 = document.createElement('script'); //script要素を作成
						document.head.appendChild(script2); //head要素にscript要素を追加
						//カレンダーの読み込み完了
						script2.onload = function () {
							yproxSearchFormInit(nInitDay, nInitPer, nInitStay, nInitRoom, nOpMaxYear, nOpMaxPer, nOpMaxNights, nOpMaxRoom, flagNoDate, flagCalendar, nInitCalendar, calendarSpanStr, windowMobileWidth, wr_wait, nInitCalendarMobile);
						};
						script2.src = calendarJs; //src属性にjsのパスを指定
					}
					switch (userLanguage) {
						case 'ja':
							//日本語
							script.src = calendarLangJa; //src属性にjsのパスを指定
							scriptDayjs.src = dayjsJa; //src属性にjsのパスを指定
							textCheckInnOut = textCheckInnOutJP;
							break;
						case 'ja-JP':
							//日本語
							script.src = calendarLangJa; //src属性にjsのパスを指定
							scriptDayjs.src = dayjsJa; //src属性にjsのパスを指定
							textCheckInnOut = textCheckInnOutJP;
							break;
						case 'ko':
							//韓国語
							script.src = calendarLangKo; //src属性にjsのパスを指定
							scriptDayjs.src = dayjsKo; //src属性にjsのパスを指定
							textCheckInnOut = textCheckInnOutKR;
							break;
						case 'ko-KR':
							//韓国語
							script.src = calendarLangKo; //src属性にjsのパスを指定
							scriptDayjs.src = dayjsKo; //src属性にjsのパスを指定
							textCheckInnOut = textCheckInnOutKR;
							break;
						case 'zh-CN':
							//中国語(簡体字)
							script.src = calendarLangZh; //src属性にjsのパスを指定
							scriptDayjs.src = dayjsZh; //src属性にjsのパスを指定
							textCheckInnOut = textCheckInnOutCN;
							break;
						case 'zh-TW':
							//中国語(繁体字)
							script.src = calendarLangZh_TW; //src属性にjsのパスを指定
							scriptDayjs.src = dayjsTW; //src属性にjsのパスを指定
							textCheckInnOut = textCheckInnOutTW;
							break;
						default:
							//英語
							textCheckInnOut = textCheckInnOutEN;
							break;
					}
				} else {
					//英語の場合は言語ファイルは読み込まない
					const script2 = document.createElement('script'); //script要素を作成
					document.head.appendChild(script2); //head要素にscript要素を追加
					//カレンダーの読み込み完了
					script2.onload = function () {
						yproxSearchFormInit(nInitDay, nInitPer, nInitStay, nInitRoom, nOpMaxYear, nOpMaxPer, nOpMaxNights, nOpMaxRoom, flagNoDate, flagCalendar, nInitCalendar, calendarSpanStr, windowMobileWidth, wr_wait, nInitCalendarMobile);
					};
					script2.src = calendarJs; //src属性にjsのパスを指定
				}
			};
			link.href = calendarCss; //href属性にcssのパスを指定
		} else {
			//カレンダーを表示しない場合はそのまま検索フォームの初期化
			yproxSearchFormInit(nInitDay, nInitPer, nInitStay, nInitRoom, nOpMaxYear, nOpMaxPer, nOpMaxNights, nOpMaxRoom, flagNoDate, flagCalendar, nInitCalendar, calendarSpanStr, windowMobileWidth, wr_wait, nInitCalendarMobile);
		}
	};
	scriptDayjs.src = dayjsPath; //src属性にjsのパスを指定
});

/**
 * functions
 */

/**
 * 検索フォームの初期化
 * @param nInitDay - 日付(○日後) ※本日の場合は 0
 * @param nInitPer - 人数
 * @param nInitStay - 泊数
 * @param nInitRoom - 部屋数
 * @param nOpMaxYear - 日付(今年も含めて何年分表示するか)
 * @param nOpMaxPer - 人数(最大選択値)
 * @param nOpMaxNights - 泊数(最大選択値)
 * @param nOpMaxRoom - 部屋数(最大選択値)
 * @param flagNoDate - 日付(日付なし)の有無
 * @param flagCalendar - カレンダーを表示するかどうか
 * @param nInitCalendar - カレンダーの月の表示数
 * @param calendarSpanStr - カレンダーの日付の間に入れる文字
 * @param windowMobileWidth - ウィンドウサイズ(モバイル)
 * @param wr_wait - リサイズイベント発生時の待ち時間
 */
function yproxSearchFormInit(nInitDay, nInitPer, nInitStay, nInitRoom, nOpMaxYear, nOpMaxPer, nOpMaxNights, nOpMaxRoom, flagNoDate, flagCalendar, nInitCalendar, calendarSpanStr, windowMobileWidth, wr_wait, nInitCalendarMobile) {
	const Body = document.body; // body
	const searchForm = Body.querySelectorAll('.js-yprox-searchForm'); // search form
	const lenSearchForm = searchForm.length; // formの数
	const userLanguage = FORCE_LANGUAGE || navigator.language; //言語を取得
	let strPersons = ''; // 人数の単位
	let strNights = ''; // 泊数の単位
	let strRooms = ''; // 部屋数の単位
	let calendarLocale = null; // カレンダーの言語
	const rangeSeparators = ['から', 'to', '至', '~']; // カレンダーの日付の間に入れる文字
	const yproXClendars = [];
	if (String(userLanguage).indexOf('ja') != -1 || String(userLanguage).indexOf('ja-JP') != -1 || String(userLanguage).indexOf('zh-CN') != -1 || String(userLanguage).indexOf('ko') != -1 || String(userLanguage).indexOf('ko-KR') != -1 || String(userLanguage).indexOf('zh-TW') != -1) {
		// 言語が英語以外の場合
		switch (userLanguage) {
			case 'ja':
				// 日本語の場合
				if (flagCalendar) {
					calendarLocale = ja.Japanese;
				}
				strPersons = '名';
				strNights = '泊';
				strRooms = '部屋';
				dayjs.locale('ja'); //日本語に設定
				break;
			case 'ja-JP':
				// 日本語の場合
				if (flagCalendar) {
					calendarLocale = ja.Japanese;
				}
				strPersons = '名';
				strNights = '泊';
				strRooms = '部屋';
				dayjs.locale('ja'); //日本語に設定
				break;
			case 'ko':
				// 韓国語の場合
				if (flagCalendar) {
					calendarLocale = ko.Korean;
				}
				strPersons = '명';
				strNights = '박';
				strRooms = '방';
				dayjs.locale('ko'); //日本語に設定
				break;
			case 'ko-KR':
				// 韓国語の場合
				if (flagCalendar) {
					calendarLocale = ko.Korean;
				}
				strPersons = '명';
				strNights = '박';
				strRooms = '방';
				dayjs.locale('ko'); //日本語に設定
				break;
			case 'zh-CN':
				// 簡体字中国語の場合
				if (flagCalendar) {
					calendarLocale = zh.Mandarin;
				}
				strPersons = '名';
				strNights = '晚';
				strRooms = '间';
				dayjs.locale('zh-cn'); //日本語に設定
				break;
			case 'zh-TW':
				// 繁体字中国語の場合
				if (flagCalendar) {
					calendarLocale = window['zh-tw'].MandarinTraditional;
				}
				strPersons = '名';
				strNights = '晚';
				strRooms = '間';
				dayjs.locale('zh-tw'); //日本語に設定
				break;
			default:
				dayjs.locale('en'); //英語に設定
				break;
		}
	} else {
		// 言語が英語の場合
		strPersons = 'guest(s)';
		strNights = 'night(s)';
		strRooms = 'room(s)';
	}
	// formの数だけループ
	for (let i = 0; i < lenSearchForm; i++) {
		const form = searchForm[i]; // form
		flagCalendar = form.getAttribute('data-calendar') === '' ? true : false; //カレンダーを表示するかどうか
		flagNoDate = form.getAttribute('data-no-date') === '' ? true : false; //日付なしを表示するかどうか
		// 日付の初期値を設定
		const d = dayjs().add(nInitDay, 'day'); // dayjs object
		let nYear = d.year(); // 年
		let nMonth = d.month() + 1; // 月
		let nDay = d.date(); // 日
		const formWrpCheckInn = form.querySelector('.js-yprox-searchForm__wrpCheckInn'); // 日付のラッパー
		const formCheckInn = form.querySelector('.js-yprox-searchForm__checkin'); //日付
		const formBoxCheckInnDay = form.querySelector('.js-yprox-searchForm__boxCheckin-day'); // 日付(日)のラッパー
		const formCheckInnDay = form.querySelector('.js-yprox-searchForm__checkin-day'); // 日付(日)
		const formBoxCheckInnMonth = form.querySelector('.js-yprox-searchForm__boxCheckin-month'); // 日付(月)のラッパー
		const formCheckInnMonth = form.querySelector('.js-yprox-searchForm__checkin-month'); // 日付(月)
		const formBoxCheckInnYear = form.querySelector('.js-yprox-searchForm__boxCheckin-year'); // 日付(年)
		const formCheckInnYear = form.querySelector('.js-yprox-searchForm__checkin-year');// 日付(年)
		const formNoDate = form.querySelector('.js-yprox-searchForm__noDate'); // 日付(日付なし)
		const formCheckInnOut = form.querySelector('.js-yprox-searchForm__checkInnOut'); // カレンダー
		// 人数
		const formAdults = form.querySelector('.js-yprox-searchForm__adults');
		const formWrpAdults = form.querySelector('.js-yprox-searchForm__wrpAdults');
		let calenderWidth = 0; // カレンダーの幅
		let calenderHeight = 0; // カレンダーの高さ
		let calenderSizeUnit = window.innerWidth > windowMobileWidth ? 2.3 : 1.0;
		//nOpMaxPerの数だけoptionを追加
		if (formAdults) {
			for (let j = 1; j <= nOpMaxPer; j++) {
				const Option = document.createElement('option');
				Option.value = j;
				Option.textContent = j + strPersons;
				formAdults.appendChild(Option);
				if (j === nInitPer) {
					Option.setAttribute('selected', 'selected');
				}
			}
		}
		// 泊数
		const formNights = form.querySelector('.js-yprox-searchForm__nights');
		const formWrpNights = form.querySelector('.js-yprox-searchForm__wrpNights');
		//nOpMaxNightsの数だけoptionを追加
		if (formNights) {
			for (let j = 1; j <= nOpMaxNights; j++) {
				const Option = document.createElement('option');
				Option.value = j;
				Option.textContent = j + strNights;
				formNights.appendChild(Option);
				if (j === nInitStay) {
					Option.setAttribute('selected', 'selected');
				}
			}
		}
		// 部屋数
		const formRoom = form.querySelector('.js-yprox-searchForm__rooms');
		const formWrpRoom = form.querySelector('.js-yprox-searchForm__wrpRooms');
		if (flagCalendar) {
			// カレンダーを表示する場合
			formBoxCheckInnYear && formWrpCheckInn.removeChild(formBoxCheckInnYear); // 年のラッパーを削除
			formBoxCheckInnMonth && formWrpCheckInn.removeChild(formBoxCheckInnMonth); // 月のラッパーを削除
			formBoxCheckInnDay && formWrpCheckInn.removeChild(formBoxCheckInnDay); // 日のラッパーを削除
			formWrpNights && formWrpNights.parentNode.removeChild(formWrpNights); // 泊数のラッパーを削除
			//デフォルトの泊数は削除したので検索用にinputを追加
			const formNights = document.createElement('input');
			formNights.type = 'hidden';
			formNights.name = 'nights';
			formNights.value = nInitStay;
			formNights.classList.add('js-yprox-searchForm__nights');
			formWrpCheckInn.appendChild(formNights);
			// カレンダーの初期値を設定
			formCheckInn.value = d.format('YYYYMMDD'); // 日付
			const fp = flatpickr(formCheckInnOut, {
				locale: calendarLocale, // 言語
				mode: "range", // 日付の範囲を選択
				dateFormat: 'Y/m/d(D)', // 日付のフォーマット
				defaultDate: [dayjs().add(nInitDay, 'day').format('YYYY/MM/DD'), dayjs().add(nInitDay + 1, 'day').format('YYYY/MM/DD')], // 初期値
				showMonths: window.innerWidth > windowMobileWidth ? nInitCalendar : nInitCalendarMobile, // 月の表示数
				minDate: 'today', // 今日以降の日付のみ選択可能
				maxDate: dayjs().add(nOpMaxYear - 1, 'year').format('YYYY/MM/DD'), // カレンダーの最大日付
				static: true, // カレンダーの表示場所をinputの隣に固定
				onDayCreate: function (dObj, dStr, fp, dayElem) {
					// カレンダーの日付が表示された時
					/**
					 *   曜日のクラスを付与
					 * */
					switch (dayjs(dayElem.dateObj).format('d')) {
						case '0':
							dayElem.classList.add('is-sunday');
							break;
						case '1':
							dayElem.classList.add('is-monday');
							break;
						case '2':
							dayElem.classList.add('is-tuesday');
							break;
						case '3':
							dayElem.classList.add('is-wednesday');
							break;
						case '4':
							dayElem.classList.add('is-thursday');
							break;
						case '5':
							dayElem.classList.add('is-friday');
							break;
						case '6':
							dayElem.classList.add('is-saturday');
							break;
					}
				},
				onChange: function (selectedDates, dateStr, instance) {
					// 日付が変更された時
					const d = dayjs(selectedDates[0]); // dayjs object
					nYear = d.year(); // 年
					nMonth = d.month() + 1; // 月
					nDay = d.date(); // 日
					formCheckInn.value = d.format('YYYYMMDD'); // 日付
					// チェックアウト日の案内を表示
					if (!flagCalendarHideCheckOutText && selectedDates.length <= 1) {
						queueMicrotask(() => {
							showCheckOutInfo(instance.selectedDateElem);
						});
					}
					//泊数を再計算
					const nStay = selectedDates.length <= 1 ? null : dayjs(selectedDates[1]).diff(dayjs(selectedDates[0]), 'day'); // 泊数
					if (nStay !== null) {
						/**
						 *   チェックイン・チェックアウト日が選択された場合
						 * */
						formNights.name = 'nights';
						formNights.value = nStay; // 泊数
					} else {
						formNights.removeAttribute('name');
					}
					/**
					 * カレンダーInput内の文字を初期設定からcalendarSpanStr に変更
					 */
					if (calendarSpanStr && calendarSpanStr !== '') {
						const input = instance._input;
						let str = '';
						const lenSeparators = rangeSeparators.length;
						for (let i = 0; i < lenSeparators; i++) {
							if (input.value.indexOf(rangeSeparators[i]) !== -1) {
								str = input.value.replace(rangeSeparators[i], calendarSpanStr);
							}
						}
						input.value = str;
					}
					// inputのvalueを変更
					if (selectedDates.length === 1) {
						instance.input.value = d.format('YYYY/MM/DD(ddd)');
					} else {
						const dd = dayjs(selectedDates[0]).format('YYYYMMDD');
						const dd2 = dayjs(selectedDates[1]).format('YYYYMMDD');
						if (dd === dd2) {
							instance.input.value = d.format('YYYY/MM/DD(ddd)');
						}
					}
				}, onReady: function (selectedDates, dateStr, instance) {
					// カレンダーが表示された時
					/**
					 * カレンダーInput内の文字を初期設定からcalendarSpanStr に変更
					 */
					if (calendarSpanStr && calendarSpanStr !== '') {
						const input = instance._input;
						let str = '';
						const lenSeparators = rangeSeparators.length;
						//スタイルを調整する
						if (instance.calendarContainer) {
							const container = instance.calendarContainer.querySelector('.flatpickr-innerContainer');
							if (container) {
								container.style.overflow = 'visible';
								const outer = container.querySelector('.flatpickr-days');
								if (outer) {
									outer.style.overflow = 'visible';
								}
							}
						}
						for (let i = 0; i < lenSeparators; i++) {
							if (input.value.indexOf(rangeSeparators[i]) !== -1) {
								str = input.value.replace(rangeSeparators[i], calendarSpanStr);
							}
						}
						input.value = str;
					}
				},
				onClose: function (selectedDates, dateStr, instance) {
					const calender = instance.calendarContainer;
					if (calender && form.classList.contains('is-position-auto')) {
						// position-autoの場合は表示調整のためにカレンダーを非表示
						calender.style.display = 'none';
					}
				}
			});
			yproXClendars.push(fp); // カレンダーを配列に格納
			calenderWidth = window.innerWidth > windowMobileWidth ? parseInt(window.getComputedStyle(fp.calendarContainer).width) * nInitCalendar : parseInt(window.getComputedStyle(fp.calendarContainer).width) * nInitCalendarMobile; // カレンダーの幅
			calenderHeight = calenderWidth / calenderSizeUnit; // カレンダーの高さ
			// form親要素の位置によってカレンダーの表示位置を調整するための処理
			if (form.getAttribute('data-calender-position') === 'auto') {
				// data-calender-positionがautoの場合
				form.classList.add('is-position-auto');
				if (form && formCheckInnOut) {
					formCheckInnOut.addEventListener('click', function (e) {
						const target = e.currentTarget;
						const form = target.closest('.js-yprox-searchForm');
						const parent = form.closest('.js-yprox-searchForm-parent');
						const calender = form.querySelector('.flatpickr-calendar');
						const top = parent ? parent.getBoundingClientRect().top : form.getBoundingClientRect().top;
						// カレンダーの高さより親要素の上からの位置が下の場合はカレンダーを上に表示
						if (top >= calenderHeight) {
							form.setAttribute('data-calender-position', 'bottom');
							queueMicrotask(() => {
								calender.style.display = 'block'; // カレンダーを表示
							});
						} else {
							form.setAttribute('data-calender-position', 'top');
							queueMicrotask(() => {
								calender.style.display = 'block'; // カレンダーを表示
							});
						}
					});
				}
			}
		} else {
			// カレンダーを表示しない場合
			formWrpCheckInn.removeChild(formCheckInnOut); // カレンダーを削除
			//年
			if (formCheckInnYear) {
				//nOpMaxYearの数だけoptionを追加
				for (let j = 0; j < nOpMaxYear; j++) {
					const Option = document.createElement('option');
					Option.value = dayjs().add(j, 'year').year();
					Option.textContent = dayjs().add(j, 'year').year();
					formCheckInnYear.appendChild(Option);
					if (Option.value === String(nYear)) {
						Option.setAttribute('selected', 'selected');
					}
				}
				// 年の変更
				formCheckInnYear.addEventListener('change', function (e) {
					nYear = e.currentTarget.value;
					const yd = dayjs().year(nYear).month(nMonth - 1).date(1);
					const nMaxDay = yd.endOf('month').date();
					if (Number(nMaxDay) < Number(nDay)) {
						nDay = nMaxDay;
					}
					// 年の変更時に日付の最大値を変更
					setMaxDate(formCheckInnDay, nMaxDay, nDay, String(nYear) + String(ToDoubleDigits(nMonth)) + String(ToDoubleDigits(nDay)));
					//検索年月日を変更
					setSearchDate(formCheckInn, nYear, nMonth, nDay);
				});
			}
			//月
			if (formCheckInnMonth) {
				// 12ヶ月分のoptionを追加
				for (let j = 1; j <= 12; j++) {
					const Option = document.createElement('option');
					Option.value = j;
					Option.textContent = j;
					formCheckInnMonth.appendChild(Option);
					if (j === nMonth) {
						Option.setAttribute('selected', 'selected');
					}
				}
				// 月の変更
				formCheckInnMonth.addEventListener('change', function (e) {
					nMonth = e.currentTarget.value;
					const md = dayjs().year(nYear).month(nMonth - 1).date(1);
					const nMaxDay = md.endOf('month').date();
					if (Number(nMaxDay) < Number(nDay)) {
						nDay = nMaxDay;
					}
					// 月の変更時に日付の最大値を変更
					setMaxDate(formCheckInnDay, nMaxDay, nDay, String(nYear) + String(ToDoubleDigits(nMonth)) + String(ToDoubleDigits(nDay)));
					//検索年月日を変更
					setSearchDate(formCheckInn, nYear, nMonth, nDay);
				});
			}
			//日
			if (formCheckInnDay) {
				const nMaxDay = d.endOf('month').date();
				// 日付の変更
				formCheckInnDay.addEventListener('change', function (e) {
					nDay = e.currentTarget.value;
					//検索年月日を変更
					setSearchDate(formCheckInn, nYear, nMonth, nDay);
				});
				// 月の最大日数分のoptionを追加
				setMaxDate(formCheckInnDay, nMaxDay, nInitDay);
			}
			// 日付
			if (formCheckInn) {
				// 日付の初期値を設定
				setSearchDate(formCheckInn, nYear, nMonth, nDay);
			}
		}
		// 日付なし
		if (formNoDate) {
			// 日付なしの初期値を設定
			const parentFormCheckInnOut = formCheckInnOut ? formCheckInnOut.parentNode : null;
			if (flagNoDate) {
				formNoDate.setAttribute('checked', 'checked');
				formCheckInn.setAttribute('disabled', 'disabled');
				if (flagCalendar) {
					// カレンダーを表示する場合
					formCheckInnOut.setAttribute('disabled', 'disabled');
					parentFormCheckInnOut && parentFormCheckInnOut.setAttribute('disabled', 'disabled');
				} else {
					// カレンダーを表示しない場合
					formCheckInnYear.setAttribute('disabled', 'disabled');
					formCheckInnMonth.setAttribute('disabled', 'disabled');
					formCheckInnDay.setAttribute('disabled', 'disabled');
				}
			}
			// 日付なしの変更
			formNoDate.addEventListener('change', function (e) {
				// 日付なしのチェックが入っている場合
				if (e.currentTarget.checked) {
					formCheckInn.setAttribute('disabled', 'disabled');
					formCheckInnOut && formCheckInnOut.setAttribute('disabled', 'disabled');
					formCheckInnYear && formCheckInnYear.setAttribute('disabled', 'disabled');
					formCheckInnMonth && formCheckInnMonth.setAttribute('disabled', 'disabled');
					formCheckInnDay && formCheckInnDay.setAttribute('disabled', 'disabled');
					parentFormCheckInnOut && parentFormCheckInnOut.setAttribute('disabled', 'disabled');
				} else {
					// 日付なしのチェックが入っていない場合
					formCheckInn.removeAttribute('disabled');
					formCheckInnOut && formCheckInnOut.removeAttribute('disabled');
					formCheckInnYear && formCheckInnYear.removeAttribute('disabled');
					formCheckInnMonth && formCheckInnMonth.removeAttribute('disabled');
					formCheckInnDay && formCheckInnDay.removeAttribute('disabled');
					parentFormCheckInnOut && parentFormCheckInnOut.removeAttribute('disabled');
				}
			});
		}
		//nOpMaxRoomの数だけoptionを追加
		if (formRoom) {
			for (let j = 1; j <= nOpMaxRoom; j++) {
				const Option = document.createElement('option');
				Option.value = j;
				Option.textContent = j + strRooms;
				formRoom.appendChild(Option);
				if (j === nInitRoom) {
					Option.setAttribute('selected', 'selected');
				}
			}
		}
		// フォームが複数ある場合は、ID名重複を避けるため、の末尾に数字を付ける
		if (lenSearchForm > 1) {
			//フォームの数だけクラス名を追加
			form.classList.add('js-yprox-searchForm_' + String(i + 1));
			const labels = form.querySelectorAll('.js-yprox-searchForm__wrpLabel'); // ラベル
			const lenLabels = labels.length; // ラベルの数
			// ラベルのfor属性とinputのid属性に数字を付ける
			for (let j = 0; j < lenLabels; j++) {
				const wrpLabel = labels[j]; // ラベルのラッパー
				const label = wrpLabel.querySelectorAll('label'); // ラベル
				const lenLabel = label.length; // ラベルの数
				const input = wrpLabel.querySelectorAll('input'); // input
				const lenInput = input.length; // inputの数
				const select = wrpLabel.querySelectorAll('select'); // select
				const lenSelect = select.length; // selectの数
				// ラベルが1つ以上ある場合
				if (lenLabel > 0) {
					// ラベルのfor属性に数字を付ける
					for (let k = 0; k < lenLabel; k++) {
						label[k].setAttribute('for', label[k].getAttribute('for') + '_' + String(i + 1));
					}
				}
				// inputが1つ以上ある場合
				if (lenInput > 0) {
					// inputのid属性に数字を付ける
					for (let k = 0; k < lenInput; k++) {
						if (input[k].getAttribute('id') && input[k].getAttribute('id') !== '') {
							input[k].setAttribute('id', input[k].getAttribute('id') + '_' + String(i + 1));
						}
					}
				}
				// selectが1つ以上ある場合
				if (lenSelect > 0) {
					// selectのid属性に数字を付ける
					for (let k = 0; k < lenSelect; k++) {
						if (select[k].getAttribute('id') && select[k].getAttribute('id') !== '') {
							select[k].setAttribute('id', select[k].getAttribute('id') + '_' + String(i + 1));
						}
					}
				}
			}
		}

	}
	window.addEventListener('resize', function () {
		setNumCalendarMonth(windowMobileWidth, wr_wait, yproXClendars, nInitCalendar, nInitCalendarMobile);
	}, false);
}

/**
 * 日付の最大値を変更
 * @param select 日付のselect要素
 * @param days 最大値
 * @param initDay 初期値
 */
function setMaxDate(select, days, initDay, currentDay = null) {
	const d = !currentDay ? dayjs().add(initDay, 'day').date() : dayjs(currentDay).date();
	select.innerHTML = '';
	for (let j = 1; j <= days; j++) {
		const Option = document.createElement('option');
		Option.value = j;
		Option.textContent = j;
		select.appendChild(Option);
		if (j === d) {
			Option.setAttribute('selected', 'selected');
		}
	}
}

/**
 * 日付の初期値を設定
 * @param checkInn チェックイン日付のinput要素
 * @param year 年
 * @param month 月
 * @param day 日
 */
function setSearchDate(checkInn, year, month, day) {
	checkInn.value = String(year) + String(ToDoubleDigits(Number(month))) + String(ToDoubleDigits(Number(day)));
}

/**
 * 0埋め
 * @param num 数値
 * @param digits 桁数
 * @returns {string}
 * @constructor
 */
function ToDoubleDigits(num, digits = 2) {
	return (Array(digits).join('0') + num).slice(-digits);
};

/**
 * windowの幅によってカレンダーの表示月を変更
 * @param wm windowの幅
 * @param wait ウィンドウリサイズ時の待ち時間
 * @param init 初期表示かどうか
 * @param calendars カレンダーの要素
 * @param numCalendar カレンダーの表示月数
 */
function setNumCalendarMonth(wm, wait, calendars, numCalendar, numCalendarMobile) {
	const len_c = calendars.length;
	if (len_c > 0) {
		clearTimeout(yprox_wr_queue);
		yprox_wr_queue = setTimeout(function () {
			if (wm > yprox_wr_currentWidth) {
				if (yprox_wr_currentWidth === window.innerWidth && yprox_wr_currentHeight === window.innerHeight) {
					return;
				}
			} else {
				if (yprox_wr_currentWidth === window.innerWidth) {
					return;
				}
			}
			yprox_wr_currentWidth = window.innerWidth;
			yprox_wr_currentHeight = window.innerHeight;
			//カレンダーの表示月を変更
			if (wm > yprox_wr_currentWidth) {
				//モバイルの場合
				for (let i = 0; i < len_c; i++) {
					// calendars[i].destroy();
					calendars[i].set({ showMonths: numCalendarMobile });
				}
			} else {
				//PCの場合
				for (let i = 0; i < len_c; i++) {
					// calendars[i].destroy();
					calendars[i].set({ showMonths: numCalendar });
				}
			}
		}, wait);
	}
};

/**
 * チェックアウト日の案内を表示
 */
function showCheckOutInfo(selectElem) {
	// 要素が存在する場合
	if (selectElem) {
		let positionClass = 'none';
		const cm = document.createElement('em');
		const cmb = document.createElement('b');
		cm.classList.add('flat__checkOutComment');
		cm.classList.add(positionClass);
		cmb.innerHTML = textCheckInnOut;
		cm.appendChild(cmb);
		selectElem.appendChild(cm);
		//スタイルを適用
		selectElem.style.position = 'relative';
		cm.style.position = 'absolute';
		cm.style.bottom = '99%';
		cm.style.left = '50%';
		cm.style.transform = 'translateX(-50%)';
		cm.style.color = '#000';
		cm.style.fontSize = '12px';
		cm.style.lineHeight = '1.4';
		cm.style.padding = '.5em .5em';
		cm.style.borderRadius = '.25em';
		cm.style.backgroundColor = '#f6f6f6';
		cm.style.boxShadow = '0 0 5px rgba(0,0,0,.2)';
		cm.style.border = '1px solid #dedede';
		cm.style.zIndex = '100';
		cm.style.width = '10em';
		cm.style.textAlign = 'center';
		cm.style.pointerEvents = 'none';
		cm.style.transition = 'opacity .3s ease-in-out';
		cm.style.opacity = '1';
		// 曜日によってクラスを付与
		if (selectElem.classList.contains('is-sunday') || selectElem.classList.contains('is-monday')) {
			positionClass = 'is-sunday';
			cm.style.left = '0';
			cm.style.transform = 'translateX(0)';
		} else if (selectElem.classList.contains('is-saturday') || selectElem.classList.contains('is-friday')) {
			positionClass = 'is-saturday';
			cm.style.right = '0';
			cm.style.left = 'auto';
			cm.style.transform = 'translateX(0)';
		}
		//3秒後に削除
		setTimeout(() => {
			cm.classList.add('is-hide');
			cm.style.opacity = '0';
			//0.3秒後に削除
			setTimeout(() => {
				cm.remove();
			}, 300);
		}, 3000);
	}
}
