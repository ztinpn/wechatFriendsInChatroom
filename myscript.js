console.log("Hi!");

(function(){


function initFun()
{

	var baseURI = "https://wx.qq.com/cgi-bin/mmwebwx-bin/";
	var userAvatarBaseUrI = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=";

	function getJson(url,method,head)
	{
	    	return new Promise(	
	    		function(resolve,reject)
	    		{
			        var xhr = new XMLHttpRequest();
			        xhr.onload = function(e){
			        	if(this.status == 200){
			        		var results = JSON.parse(this.responseText);
			                resolve(results);
			        	}
			        }
			        xhr.onerror = function(e){
			        	reject(e);
			        }
			        if(method == "get"){
			            xhr.open("GET",url,true);
			            xhr.send();
			        }
			        else{
			            xhr.open("POST",url,true);
			            xhr.send(head);
			        }
	    	});
	}
	function dealCommon(usersInChatRoom,chatRoomName)//显示群里的好友列表
	{
	    var commonList = [];
	    var commonListStr = "<ul>";
	    var isEmpty = true;
	    var cnt = 0;
	    for(var i = 0; i < usersInChatRoom.length; i ++ ){
	        if(listObj[usersInChatRoom[i].UserName] && usersInChatRoom[i].UserName != myUserName){
	            commonList.push(usersInChatRoom[i]);
	            commonListStr += "<li><img style=\"width:30px;vertical-align: middle;\" src='"+
	            userAvatarBaseUrI+usersInChatRoom[i].UserName
	            +"'/>"+usersInChatRoom[i].NickName + "</li>";
	            isEmpty = false;
	            cnt++;
	        }
	    }
	    commonListStr = "<div id='total_num'>"+chatRoomName+"<br>共"+cnt+"个通讯录好友</div>"+commonListStr
	    document.querySelector("#friends_in_chatroom").innerHTML = commonListStr +"</ul><style type='text/css'>" +
	    		["#friends_in_chatroom img{margin-right:5px;}", 
	    		"#friends_in_chatroom li:not(:last-child) {margin-bottom: 10px;}",
	    		"#total_num{text-align: center;margin-bottom: 5px;}",
	    		""].join("\n")+
	    		"</style>";
	}
	function getCommonUser(chatRoomName,username)//得到选定群的好友列表
	{
	    function getCookie(key)
	    {
	    	return document.cookie.match(eval("/; "+key+"=(.+?); /"))[1];
	    }
	    var head = '{"BaseRequest":{"Uin":'+getCookie("wxuin")
	    			+ ',"Sid":"'+getCookie("wxsid")+'","Skey":"'
	    			+ skey + '","DeviceID":""},"Count":1,"List":[{"UserName":"'
	    			+ username + '","EncryChatRoomId":""}]}';
	    getJson(baseURI + "webwxbatchgetcontact?type=ex&r=1","post",head)//获取选定群的成员列表
	    .then(
	    		function(usersInChatRoom)
	    		{
	    			usersInChatRoom = usersInChatRoom.ContactList[0].MemberList;
	    		    dealCommon(usersInChatRoom,chatRoomName);
	    		}
	    )
	    .catch(
	    		function(e)
	    		{
	    			div.innerText="失败。。";
	    		}
	    );
	}

	if(document.querySelectorAll(".nav_view .chat_list .chat_list div").length > 3){//说明登录成功并且最近联系人列表已载入
		var skey = document.querySelector(".header .avatar").innerHTML.match(/;skey=(.+?)\"/)[1];
		var div = document.createElement("div");//显示框
		div.id = "friends_in_chatroom";
		div.style.cssText = "position:fixed;padding:10px;left:0px;"
			+ "top:0px;font-size:10pt;color:black;background-color:white;" +
					"max-height: 95%;overflow: auto;"
		document.body.appendChild(div);
		
		var listObj = {"isEmpty":true};//用于存储通讯录里的好友列表;
		var tryCount = 0;
		function initListObj(){
			tryCount ++;
			div.innerText="获取通讯录的好友列表中...";
			if(listObj["isEmpty"]){
				getJson(baseURI + "webwxgetcontact?lang=zh_CN&r=1&seq=0&skey=" + skey,"get","")//获取通讯录的好友列表
				.then(
						function(ContactList)
						{
							var MemberList = ContactList.MemberList;
					        listObj = {};
					        for(var i = 0; i < MemberList.length; i ++){
					            listObj[MemberList[i]["UserName"]] = MemberList[i];
					        }
					        listObj["isEmpty"] = false;
					        div.innerText="获取通讯录的好友列表中...成功!";
					        setTimeout(function(){
					        	div.innerText="请点击群名称";
					        },1000);
						}
				).catch(function(e){
					if(tryCount < 10){
						initListObj();
					}
					else{
						div.innerText="获取通讯录的好友列表失败！";
					}
				});
			}
		}
		initListObj();
		var myUserName = document.querySelectorAll(".header img")[0].src.match(/username=(.+?)&/)[1];
		document.querySelectorAll(".nav_view").forEach(
				function(x)
				{
					x.onclick=function(e)
					{ 
					    div.innerText="载入中...";
					    var currentEle = e.srcElement;
					    while(currentEle.className.indexOf("chat_item") == -1 
					    		&&
					    		currentEle.className.indexOf("contact_item") == -1 ){
					    	currentEle = currentEle.parentElement;
					    	if(currentEle === null){
					    		div.innerText="请点击群名称";
					    		return false;
					    	}
					    }
					    glo = currentEle;
					    if(currentEle.className.indexOf("chat_item") > -1){
					    	var chatRoomName = currentEle.querySelectorAll(".nickname_text")[0].innerText;
					    }
					    else{
					    	var chatRoomName = currentEle.querySelectorAll(".nickname")[0].innerText;
					    }
					    var username = currentEle.querySelectorAll(".avatar img")[0].src.match(
		    			/username=(.+?)&/)[1];
					    gloText = chatRoomName;
					    if(username.substring(1,2) != "@"){
					    	div.innerText=gloText+" 已经是好友了！";
					    }
					    else{
					    	getCommonUser(gloText,username);
					    }
					};
				}
		);
	}
	else{
		setTimeout(function(){initFun();},1000);//等待登录
	}
}
setTimeout(function(){initFun();},1000);//等待登录
})();