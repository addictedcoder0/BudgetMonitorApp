/* Module pattern*/
var BudgetController = (function(){
    // type : expense
    var expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // type : income
    var income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // create a DS to hold the complete data set 
    var data = {
        allItem : {
            exp : [],
            inc : []
        },
        total:{
            exp : 0,
            inc : 0
        }
    };
    
    var addItem = function(type,desc,value){
        var item , itemcount ;
        itemcount = data.allItem[type].length + 1;
        if(type === 'inc'){
          item = new income(itemcount,desc,value);
        }else if(type === 'exp'){
          item = new expense(itemcount,desc,value);
        }
        data.allItem[type].push(item);
        data.total[type]+=value;
        return item;
    };
    
    var deleteItem =  function (type,index){
        var indexArray = data.allItem[type].map(function(current){
           return current.id; 
        });
        
        var pos = indexArray.indexOf(index);
        
        if (pos !== -1){
            // updating the data object
            data.total[type]-=data.allItem[type][pos].value;
            data.allItem[type].splice(pos,1);
        }
    };
    
    return {
        additem:addItem ,
        currentStatus:data ,
        deleteItem : deleteItem
    };
})();

var UIController = (function(){
    // remove the hardcoded class dependency by using reference
    
    var DOMClasses = {
        input_type :  '.add__type',
        input_description : '.add__description',
        input_value : '.add__value',
        input_addbtn : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        expenseValue : '.budget__expenses--value',
        expensePercentage : '.budget__expenses--percentage',
        incomeValue : '.budget__income--value',
        incomePercentage : '.budget__expenses--percentage',
        budgetValue : '.budget__value',
        container : '.container'
    };
    
    var addItemToList = function(item,type){
        var html , newHtml , element;
        if(type === 'inc'){
            element = DOMClasses.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
        }else{
            element = DOMClasses.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        newHtml = html.replace('%id%',item.id);
        newHtml = newHtml.replace('%description%',item.description);
        newHtml = newHtml.replace('%value%',item.value);
        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    };
    //update the UI
    var updateUI = function(data){
       
        document.querySelector(DOMClasses.incomeValue).textContent = data.total['inc'];
        
        document.querySelector(DOMClasses.expenseValue).textContent = data.total['exp'];
        
        document.querySelector(DOMClasses.budgetValue).textContent = data.total['inc']-data.total['exp'];
    };
    // clear the fields 
    var clearField = function(){
        document.querySelector(DOMClasses.input_description).value = "";
        document.querySelector(DOMClasses.input_value).value = "";
        // for bringing the cursor back to the desc field
        document.querySelector(DOMClasses.input_description).focus();
    };
    
    // get the field input data and return it as JSON
    return {
        getInput : function(){
        var input_value = document.querySelector(DOMClasses.input_value).value;
        var input_desc = document.querySelector(DOMClasses.input_description).value;
            if(input_value !== ''&&input_desc !== ''){
            return{
                type :  document.querySelector(DOMClasses.input_type).value,
                description : input_desc,
                value : parseFloat(input_value) 
            };
            }else{
                return '';
            }
                
        },
    
        getDomClasses : function(){
        return DOMClasses; 
        },
        
        addItemToList:addItemToList,
        clearField : clearField,
        updateBudget: updateUI
    };
        
})();

// Master controller ha control over both budget and ui
var MasterController = (function(budgetCtrl,uiCtrl){
    // init the eventlisteners separately
    var setUpEventListeners = function(){
        console.log('init done');
        var DOMClasses = UIController.getDomClasses();
        document.querySelector(DOMClasses.input_description).focus(); 
        document.querySelector(DOMClasses.incomeValue).textContent = '0';
        document.querySelector(DOMClasses.expenseValue).textContent = '0';
        document.querySelector(DOMClasses.budgetValue).textContent = '0';
        document.querySelector(DOMClasses.input_addbtn).addEventListener('click',masterAddItem);
        // if someone press ENTER key then also we should process the data
        document.addEventListener('keypress',function(event){
        // some old browsers use 'which' instead of 'keycode'
        if(event.keyCode === 13 || event.which === 13){ 
            // 13 is the keycode for ENTER
            console.log('Enter is pressed'); 
            masterAddItem();
        } 
        });
       document.querySelector(DOMClasses.container).addEventListener('click',masterDeleteItem);
    };
    
    var updateBudget = function(data){
        // 1. calculate the budget
        
        // 2. Return the Budget
        
        // 3. Display the Budget on the UI
        UIController.updateBudget(data);
    }
    
    var masterAddItem = function(){
        // 1. get the field input data 
        var input = UIController.getInput()
        // 2. Add the item to the budget controller 
        if(input !== '' && !isNaN(input.value) && input.value>0){
        var newItem = BudgetController.additem(input.type,input.description,input.value);
//        console.log(newItem);
//        console.log(BudgetController.currentStatus);
        // 3. Add the item to the UI 
        UIController.addItemToList(newItem,input.type);
        // 4. clear the field
        UIController.clearField();
        // 5. Calculate the Budget and update it
        
        updateBudget(BudgetController.currentStatus);
        }
    };
   
    var masterDeleteItem = function(event){
                
        var itemID , itemType ,element;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        if (itemID){
            // this check is equivalent to (itemID!== null && itemID !== '')
        element = document.getElementById(itemID);
            if(element){
                element.parentElement.removeChild(element); // remove from UI
                itemID = itemID.split('-');
                itemType = itemID[0];
                itemID = parseInt(itemID[1]);
                BudgetController.deleteItem(itemType,itemID);
                updateBudget(BudgetController.currentStatus);
            }
        }
    };
    
    return {
        init:setUpEventListeners
    };
})(BudgetController,UIController);

// only part of code present outside IIFE
MasterController.init();