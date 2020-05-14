'use strict';
const logger = require("../_config/logging_defines");
module.exports = {
    bringtheTime: () => {
        var date = new Date();
        var aaaa = date.getFullYear();
        var gg = date.getDate();
        var mm = (date.getMonth() + 1);

        if (gg < 10)
            gg = "0" + gg;

        if (mm < 10)
            mm = "0" + mm;

        var cur_day = aaaa + "-" + mm + "-" + gg;

        var hours = date.getHours()
        var minutes = date.getMinutes()
        var seconds = date.getSeconds();

        if (hours < 10)
            hours = "0" + hours;

        if (minutes < 10)
            minutes = "0" + minutes;

        if (seconds < 10)
            seconds = "0" + seconds;

        return cur_day + " " + hours + ":" + minutes + ":" + seconds;
        },
        getServiceName: () => {
            // GET servicename ----------------------
            var normalizedPath = require("path").join(__dirname, "routes");
            // console.log(normalizedPath) //zeigt den Pfad an
            var servicename = normalizedPath.split("/");
            servicename = servicename[(servicename.length-3)];
            // console.log(servicename)
            return servicename;
        },

        convertTimestamp: (timestamp) => {
            var formattedDate= timestamp; 
            var formattedDate = formattedDate.replace('T', ' ').replace('Z', '');
            formattedDate=formattedDate.substring(0, formattedDate.length - 4);
            // console.log(formattedDate)
            return formattedDate;
          },

        jsonToSQLClause: (jsonObject, WhereClauseforNextAction, WhereClauseInJsonParam ) => {//hier muss ein "json" übergeben werden, was allerdings noch nicht als json geparsed wurde -> also ein String
            if (WhereClauseforNextAction === undefined){ WhereClauseforNextAction = Object.keys(jsonObject[0]);} //Wenn das JSON nur einen Objectname besitzt, soll er das Element 0 verwenden
            if (WhereClauseInJsonParam === undefined){ var WhereClauseInJson = Object.keys(jsonObject[0]);} //Wenn der dritte Parameter nicht gestzt ist, geht man davon aus, dass im JSON nur ein Objectname enthalten ist -> Ansonsten zieht die nächste Zeile
            else{var WhereClauseInJson=WhereClauseInJsonParam} 
            var count=0;
            for(var prop in jsonObject[0]) {
               if (jsonObject[0].hasOwnProperty(prop)) {++count; }
            }
            if(count >= 2 && WhereClauseInJsonParam === undefined)return "err: JSON is too big -> 3rd param is required!"; //Wenn im JSON mehr als ein "Name" ist, muss der dritte Parameter gesetzt sein, damit man weiß welches zu verwenden ist
            // console.log("WhereClause for next Query is: " + WhereClauseforNextAction)
            // console.log("WhereClause in this JSON: " + WhereClauseInJson)
            // var jsonObject = JSON.parse(rowsFromQuery);
            var JsonName = Object.keys(jsonObject[0]);           // console.log("its: " + JsonName)
            var JsonValue;
            
            // WHERE school_name IN ('program_input_1', 'program_input_2', 'program_input_3')
            var SQLstring = "where " + WhereClauseforNextAction + " IN ("
            for (var item in jsonObject) {
                // JsonValue = Object.values(jsonObject[item]);
                JsonValue = jsonObject[item][WhereClauseInJson]; 
                SQLstring += JsonValue + " , "
            }
            SQLstring=SQLstring.substring(0, SQLstring.length - 2);
            SQLstring += ")";
            // console.log(SQLstring)

            return SQLstring;
        }

 }
