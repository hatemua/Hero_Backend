module.exports = (tim)=>{
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    if(tim){
        var dateTime = date+' '+time;
    }
    var dateTime = date;
     
    return dateTime;
}