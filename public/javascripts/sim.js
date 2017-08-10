
$(document).ready(function(){
    populateDrawTable();
    $('#btnDraw').on('click', createDraw);
    $('#btnClear').on('click', clearDraws);
});

function clearDraws(event) {

    event.preventDefault();

    $.ajax({
        type: 'DELETE',
        url: 'simulator/cleardraws'
    }).done(function(data){
        console.log('CLEARD');
        $('tr').empty();
    });
}


function createDraw(event) {
    
    event.preventDefault();

    var newDraw = {
        'week': 1
    }
    var tableContent = '';
    $.ajax({
        type: 'POST',
        data: newDraw,
        url: 'simulator/draw',
        dataType: 'JSON'
    }).done(function(data){
        console.log(data);
         $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>'+ this.draw_numberx +'</td>';
            tableContent += '<td>' + this.draw_date + '</td>';
            tableContent += '</tr>';
        });

    
        populateDrawTable();
    });
}

function populateDrawTable() {

    var tableContent = '';

    $.getJSON('/simulator/drawlist', function(data){
        //alert(data);
        $.each(data, function(){
            console.log(this.draw_number);
            tableContent += '<tr>';
            tableContent += '<td>'+ this.draw_number +'</td>';
            tableContent += '<td>' + this.draw_date + '</td>';
            tableContent += '</tr>';
        });
        console.log(tableContent);
        $('#drawList table tbody').html(tableContent);
    });
}