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