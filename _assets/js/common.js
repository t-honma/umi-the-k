// header
var _html = 
'<header>' +
	'<div class="inner">' +
		'<a href="/" class="logo">' +
			'<img src="/_assets/images/common/sub_header_logo.png" alt="UMI THE K 古宇利島">' +
		'</a>' +
		'<span class="sp_menu"><img src="/_assets/images/common/sp_gnavi_btn.png" alt="MENU"></span>' +
		'<nav>' +
			'<ul class="eng">' +
				'<li><a href="/">TOP</a></li>' +
				'<li><a href="/rooms/">ROOMS</a></li>' +
				'<li><a href="/location/">LOCATION</a></li>' +
				'<li><a href="/location/#access">ACCESS</a></li>' +
				'<li><a href="/faq/">FAQ</a></li>' +
				'<li><a href="/contact/">CONTACT</a></li>' +
			'</ul>' +
			'<span class="sp_close"><img src="/_assets/images/common/sp_gnavi_btn_close.png" class="close"></span>' +
		'</nav>' +
	'</div>' +
'</header>' ;
document.getElementById("header").innerHTML = _html;

// footer
var _html = 
'<footer>' +
	'<div class="inner">' +
		'<a href="/" class="logo">' +
			'<img src="/_assets/images/common/footer_logo.png" alt="UMI THE K 古宇利島">' +
		'</a>' +
		'<p class="address">〒905-0406 沖縄県古宇利 2427-1</p>' +
		'<p class="tel">Tel／Fax： 0980-56-3997 <br class="disp_sp">（電話でお問い合わせ 10:00〜18:00）</p>' +
		'<p class="notice">※臨時休業・営業時間変更となる場合があります。<br>※時間外のお問い合わせにつきましては、下記CONTACT（お問い合わせ）よりお願いいたします。<br>※お電話でのご予約は承っておりませんので、下記RESERVATION（宿泊予約）よりお待ちしております。</p>' +
		'<div class="btn_wrap">' +
			'<a href="https://www.jalan.net/yad378230/?roomCount=1&adultNum=2&distCd=01&stayYear=&stayMonth=&dateUndecided=1&stayDay=&screenId=UWW1701&callbackHistFlg=1&stayCount=1&rootCd=04m" target="_blank" class="btn footer"><span class="eng">RESERVATION</span>宿泊予約</a>' +
			'<a href="/contact/" class="btn footer"><span class="eng">CONTACT</span>お問い合せ</a>' +
		'</div>' +
		'<div class="instagram_wrap">' +
			'<a href="https://www.instagram.com/umi_the_k_kourijima/" target="_blank"><img src="/_assets/images/common/footer_instagram.png" alt="instagram @umi_the_k_kourijima"></a>' +
			'<script src="https://snapwidget.com/js/snapwidget.js"></script>' +
			'<iframe src="https://snapwidget.com/embed/1021935" class="snapwidget-widget" allowtransparency="true" frameborder="0" scrolling="no" style="border:none; overflow:hidden;  width:100%; "></iframe>' +
		'</div>' +
	'</div>' +
'</footer>' ;
document.getElementById("footer").innerHTML = _html;

/* SPメニューの開閉 ---------------------------------*/
if (window.matchMedia("(max-width: 768px)").matches) {
// windowのサイズが768px以下
	$(".sp_menu").click(function(){
	    $("nav").addClass("visible");
	});

	$(".sp_close").click(function(){
	    $("nav").removeClass("visible");
	});

	$('.gnavi a[href]').on('click', function(event) {
	    $("nav").delay(500).removeClass("visible");
	});
}else{
// windowのサイズが768px以上
}