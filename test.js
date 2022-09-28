//^(?=.*\d)(?=.*[a-z])(?=.*[a-z]).{8,}$


function test(){
    var isValid = true;
    try {
        new RegExp("^(?=.*\d)(?=.*[a-z])(?=.*[a-z]).{8,}$");
    } catch(e) {
        isValid = false;
    }  
}