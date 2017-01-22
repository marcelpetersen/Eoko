angular.module('app.services', [])

.factory('UserInfo', [function(){
    var userData = {
            name: "",
            email: "",
            birthday: "",
            points: 0,
            eventCount: 0,
            surveyCount: 0,
            major: "",
            avatar:"",
            buildcode:""
            };
                
    return{
        setUserInfo: function(info){
			userData = {
                name : info.name,
                email: info.email,
                birthday: info.birthday,
                points: info.points,
                eventCount: info.eventCount,
                surveyCount: info.surveyCount,
                major: info.major,
                avatar: info.avatar,
                buildcode: info.buildcode
			};
				return true;
			},
			
		getUserInfo: function(){
		return userData;
		}
    };

}])


.factory('OtherInfo', [function(){
    var userData = {
            name: "",
            email: "",
            birthday: "",
            points: 0,
            eventCount: 0,
            surveyCount: 0,
            major: "",
            avatar:"",
            buildcode:""
            };
                
    return{
        setOtherInfo: function(info){
			userData = {
                name : info.name,
                email: info.email,
                birthday: info.birthday,
                points: info.points,
                eventCount: info.eventCount,
                surveyCount: info.surveyCount,
                major: info.major,
                avatar: info.avatar,
                buildcode: info.buildcode
			};
				return true;
			},
			
		getOtherInfo: function(){
		return userData;
		}
    };

}])

.service('BlankService', [function(){

}]);