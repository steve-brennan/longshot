
$(document).ready(function(){
    populateDrawTable();
    $('#btnDraw').on('click', createDraw);
    $('#btnClear').on('click', clearDraws);
    $('#btnGetNumbers').on('click', populateProbableNumberTable);
    $('#btnCalculate').on('click', calculate);
    $('#btnClearCalculations').on('click', clearCalculations);

});

/**
 * Returns a closure that will increment the week each time a draw is created. 
This is used server side to parse the next simulated draw file.
 */ 
function startWeek() {
    var week = 0;
    function incrementWeek() {
        if(week == 5) {
            week = 0;
        }
        return week += 1;
    }
    return incrementWeek;
}

//  Initialise the week counter
var getWeek = startWeek();

function clearDraws(event) {

    event.preventDefault();

    $.ajax({
        type: 'DELETE',
        url: 'simulator/deletedraws'
    }).done(function(data){
        console.log('CLEARD');
        $('tr').empty();
        getWeek = startWeek(); // Reset week counter
    });
}

//Craetes a weekly draw
function createDraw(event) {
    console.log('create draw');
    event.preventDefault();
    
    var newDraw = {
        'week': 1,//getWeek(),
        'gameName': 'SimLotto'
    }
    var tableContent = '';
    $.ajax({
        type: 'POST',
        data: newDraw,
        url: 'simulator/draw',
        dataType: 'JSON'
    }).done(function(data){ 
        console.log('create draw done');
        populateDrawTable();
    });
}

//Generate the probable number set for the exisiting draw set
function calculate(event) {
    console.log('calc called');
    event.preventDefault();

     var newProb = {
        'gameName': 'SimLotto'
    }

    $.ajax({
        type: 'POST',
        data: newProb,
        url: 'simulator/calculate',
        dataType: 'JSON'
    }).done(function(data){ 
        console.log(data);
        //populateProbableNumberTable();
    });

}

//Clear all probable number sets from the db
function clearCalculations() {

    event.preventDefault();

    $.ajax({
        type: 'DELETE',
        url: 'simulator/clearprobablenumbers'
    }).done(function(data){
        console.log('CLEARD');
        $('tr').empty();
        getWeek = startWeek(); // Reset week counter
    });

}

function populateDrawTable() {

    var tableContent = '';
    console.log('poping dt')
    $.getJSON('/simulator/drawlist', function(data){
        //alert(data);
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.draw_number +'</td>';
            tableContent += '<td>' + this.draw_date + '</td>';
            tableContent += '<td>' + this.winning_numbers + '</td>';
            tableContent += '</tr>';
        });
        $('#drawList table tbody').html(tableContent);
    });
}

function populateProbableNumberTable() {
    console.log('pop probs');
    var tableContent = '';

    $.getJSON('/simulator/probablenumbers', {'gameName':'SimLotto'} ,function(data){
        console.log(data);
        if(data) {
            let setOfNumbers = data.set_of_numbers.sort((a,b) => {
                return a.provisional_weighting - b.provisional_weighting;
            });
            tableContent += '<tr>';
            tableContent += '<td>'+ setOfNumbers[0].value +'</td>';
            tableContent += '<td>'+ setOfNumbers[1].value  +'</td>';
            tableContent += '<td>'+ setOfNumbers[2].value +'</td>';
            tableContent += '<td>'+ setOfNumbers[3].value +'</td>';
            tableContent += '<td>'+ setOfNumbers[4].value +'</td>';
            tableContent += '<td>'+ setOfNumbers[5].value  +'</td>';
            tableContent += '<td>'+ setOfNumbers[6].value  +'</td>';
            tableContent += '<td>'+ setOfNumbers[7].value  +'</td>';
            tableContent += '</tr>';

            $('#probableNumberSet table tbody').html(tableContent);
        }
    });
}

