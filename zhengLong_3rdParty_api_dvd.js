"use strict";

/*
the structure of the terms

account
  + classroom1
  + classroom2
      + class1
      + class2
          + movie1
          + movie2
*/

let api_url = "https://cors-proxy.org-3rdparty-zhenglong-pwa-dvd.workers.dev/?http://makeup.jlweb.com.tw/";

/*the structure of api - not really do anything*/
let dvd_api = {
	login: async ({cramCode = "", userName = "", passWord = ""})=>{},
	// checkMac = ()=>{}, /*temporary unavailable*/

	listClassroom: ({cramCode = "", userName = "", passWord = ""})=>{},
	// getClassroomPoint: ()=>{}, /*not implemented*/

	listClass: ({cramCode = "", userName = "", passWord = "", classroomCode = "", groupCode = ""})=>{},
	// checkClassRequiredPoint: ()=>{}, /*not implemented*/

	listMovie: ({cramCode = "", userName = "", passWord = "", classroomCode = "", groupCode = "", classCode = "" })=>{},
	// checkMovie: ()=>{}, /*not implemented*/

	//recordWatch: ()=>{} /*temporary unavailable*/
};

dvd_api.login = async ({cramCode = "", userName = "", passWord = ""})=>{
	let rawResponse = await fetch(api_url + "StuLogin.aspx", {
		method: 'POST',
		body: (new URLSearchParams({
			"StuSN": userName,
			"StuPass": passWord,
			"Code": cramCode
		})).toString(),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})

	let responseText = await rawResponse.text();
	let responseArray = responseText.split(",");

	/*check if ok and set message*/
	let ok = false;
	let msg = "";
	if(rawResponse.ok == true && responseArray[0] == "1"){
		ok = true;
		msg = "成功！";
	}else if(rawResponse.ok == true && responseText != ""){
		ok = false;
		msg = "請重新確認補習班代碼、帳號及密碼！";
	}else{ /*which means rawResponse.ok == false or responseArray == []*/
		ok = false;
		msg = "請重新確認補習班代碼，或網路是否連接成功！";
	}

	/*set student's name*/
	let stuName = "";
	if(ok){
		stuName = responseArray[1];
	}

	return {
		query: {
			cramCode: cramCode,
			userName: userName,
			passWord: passWord
		},
		ok: ok,
		msg: msg,
		stuName: stuName,
		rawResponse: rawResponse
	};
}

dvd_api.listClassroom = async ({cramCode = "", userName = "", passWord = ""})=>{
	let rawResponse = await fetch(api_url + "ClassList1.aspx", {
		method: 'POST',
		body: (new URLSearchParams({
			"StuSN": userName,
			"StuPass": passWord,
			"Code": cramCode
		})).toString(),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
	
	let responseText = await rawResponse.text();
	
	let ok = false;
	let msg = "";
	if(rawResponse.ok == true & responseText != ""){
		ok = true;
		msg = "獲取班級列表成功";
	}else if(rawResponse.ok == true & responseText == ""){
		ok = true;
		msg = "班級列表為空";
	}else{
		ok = false;
		msg = "獲取班級列表失敗！請重新確認帳號是否有效（例如再次執行帳號可用性檢查），或網路是否連接成功！";
	}

	let classroomList = [];
	if(ok){ /*data process*/
		let classroomRawList = responseText.split("<br/>");
		/* format: "{????};{班級代碼};{群組代碼},{班級名稱}" */
		for(let eachItem of classroomRawList){
			eachItem = eachItem.replaceAll(',', ';').split(';');
			if(eachItem.length == 4){ /*to avoid empty line*/
				let classroom = {
					code: 		eachItem[1],
					groupCode: 	eachItem[2],
					name: 		eachItem[3]
				}
				classroomList.push(classroom);
			}
		}
	}
	

	return {
		query: {
			cramCode: cramCode,
			userName: userName,
			passWord: passWord
		},
		ok: ok,
		msg: msg,
		classroomList: classroomList,
		rawResponse: rawResponse
	};
}

dvd_api.listClass = async ({cramCode = "", userName = "", passWord = "", classroomCode = "", groupCode = ""})=>{
	let rawResponse = await fetch(api_url + "ClassList2.aspx", {
		method: 'POST',
		body: (new URLSearchParams({
			"StuSN": userName,
			"StuPass": passWord,
			"ClassID": classroomCode,
			"Code": cramCode,
			"GroupID": groupCode
		})).toString(),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
	
	let responseText = await rawResponse.text();
	
	let ok = false;
	let msg = "";
	if(rawResponse.ok == true & responseText != ""){
		ok = true;
		msg = "獲取課程列表成功";
	}else if(rawResponse.ok == true & responseText == ""){
		ok = true;
		msg = "課程列表為空";
	}else{
		ok = false;
		/*msg = "獲取課程列表失敗！請重新確認班級是否有效（可嘗試點按[↻]），或網路是否連接成功";*/
		msg = "獲取課程列表失敗！請重新確認班級是否有效，或網路是否連接成功";
	}

	let classList = [];
	if(ok){ /*data process*/
		let classRawList = responseText.split("<br/>");
		/* format: "{課程名稱},{班級代碼},{課程代碼},{狀態}" */
		for(let eachItem of classRawList){
			eachItem = eachItem.split(',');
			if(eachItem.length == 4){ /*to avoid empty line*/
				let theClass = { /*named as "theClass" cuz "class" is a keyword*/
					className: 		eachItem[0],
					classroomCode: 	eachItem[1],
					classCode: 		eachItem[2],
					classFlag: 		eachItem[3]				
				}
				classList.push(theClass);
			}
		}
	}

	return {
		query: {
			cramCode: cramCode,
			userName: userName,
			passWord: passWord
		},
		ok: ok,
		msg: msg,
		classList: classList,
		rawResponse: rawResponse
	};
}

dvd_api.listMovie = async ({cramCode = "", userName = "", passWord = "", classroomCode = "", groupCode = "", classCode = "" }) =>{
	let rawResponse = await fetch(api_url + "MovieList.aspx", {
		method: 'POST',
		body: (new URLSearchParams({
			"MovieID": classCode,
			"StuSN": userName,
			"StuPass": passWord,
			"ClassID": classroomCode,
			"Code": cramCode,
			"GroupID": groupCode
		})).toString(),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
	
	let responseText = await rawResponse.text();
	
	let ok = false;
	let msg = "";
	if(rawResponse.ok == true & responseText != ""){
		ok = true;
		msg = "獲取影片列表成功";
	}else if(rawResponse.ok == true & responseText == ""){
		ok = true;
		msg = "影片列表為空";
	}else{
		ok = false;
		msg = "獲取影片列表失敗！請重新確認班級是否有效，或網路是否連接成功";
	}

	let movieList = [];
	if(ok){ /*data process*/
		let movieRawList = responseText.split("<br/>");
		/* format: "{順序},{影片代碼},{[按：十分不確定]是否可見}" */
		for(let eachItem of movieRawList){
			eachItem = eachItem.split(',');
			if(eachItem.length == 3){ /*to avoid empty line*/
				let movie = {
					movieOrder: parseInt(eachItem[0]),
					movieCode: eachItem[1],
					movieVisibility: eachItem[2] == "True"
				}
				movieList.push(movie);
			}
		}
	}

	return {
		query: {
			cramCode: cramCode,
			userName: userName,
			passWord: passWord
		},
		ok: ok,
		msg: msg,
		movieList: movieList,
		rawResponse: rawResponse
	};
}
export {dvd_api};
