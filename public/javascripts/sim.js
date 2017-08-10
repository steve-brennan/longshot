
$(document).ready(function(){
    populateDrawTable();
    $('#btnDraw').on('click', createDraw);
    $('#btnClear').on('click', clearDraws);


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
        url: 'simulator/cleardraws'
    }).done(function(data){
        console.log('CLEARD');
        $('tr').empty();
        getWeek = startWeek(); // Reset week counter
    });
}

function createDraw(event) {
    
    event.preventDefault();
    
    var newDraw = {
        'week': getWeek(),
        'gameName': 'SimLotto'
    }
    var tableContent = '';
    $.ajax({
        type: 'POST',
        data: newDraw,
        url: 'simulator/draw',
        dataType: 'JSON'
    }).done(function(data){ 
        console.log('create draw');
        populateDrawTable();
    });
}

function populateDrawTable() {

    var tableContent = '';

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

