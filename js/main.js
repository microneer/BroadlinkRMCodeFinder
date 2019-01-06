
$('document').ready(function() {

	function apiCall( code, params, callback ) {
		var ipAddress = $('#ipAddress').val();
		var port = $('#port').val();

		var data = $.extend( {"api_id":code,"command":"not required"}, params );
		
		$.ajax({
			'type': 'GET',
			'url': 'http://'+ipAddress+':'+port,
			'port': port, 
			'cache': true,
			'dataType': 'jsonp',
			//'data': 'cmd={"api_id":'+code+',"command":"not_required"}',
			'data': 'cmd='+JSON.stringify(data),
			'processData': false,
			'success': function(jsondata) {
				setMessage('Completed API call', 'success');
				callback(jsondata);
			},
			'error': function(jqXHR, textStatus, errorThrown){
				setMessage( 'Error: ' + textStatus + ' | ' + errorThrown );
			}
		});
	}
	
	function setMessage( message, suffix ) {
		var nDiv = $('<div>').addClass('alert').addClass('alert-'+suffix);
		nDiv.append( message );
		$('#messageContainer').html( nDiv );
	}
	
	function addCode( value ) {
		// prepend code name and = if available
		if ( $('#code').val().length > 0 ) 
			value = $('#code').val() + ' = ' + value;
		$('#recordedCodes').append( value + '\n' );
	}

	
	// handle the find device call
	$('#findDevices').click(function(event){
		event.preventDefault();
		setMessage( 'Contacting RM Bridge for list of local Broadlink devices...', 'info' );
		apiCall( 1000, {}, function(data){
			setMessage( 'Found '+data.list.length+' Broadlink device(s).', 'success' );
			
			$('#deviceList').children().remove();
			
			// add them as select options
			$.each(data.list, function(i,v) {
				var nOption = $('<option>')
					.html(v.type + ' @ ' + v.name + ', ' + v.mac)
					.data('mac',v.mac)
					.data('ip',v.name)
					.data('type',v.type);
				$('#deviceList').append( nOption );
			});
		} );
	});
	
	// handle the learn call
	$('#learn').click(function(event){
		event.preventDefault();
		
		var nSelected = $('#deviceList').children().filter(':selected');
		var mac = nSelected.data('mac');
		var ip = nSelected.data('ip');
		setMessage( 'Putting device ' + ip + ' into learn mode...', 'info' );
		
		apiCall( 1002, {"mac":mac}, function(data){
			console.log( data );
			if ( data.code != 0 ) 
			{
				setMessage( 'Error: '+ data.msg, 'danger' );
				return;
			}
			
			setMessage( 'Waiting for code to be learnt...', 'info' );
			setTimeout( function(){
				apiCall( 1003, {"mac":mac}, function(data2){
					console.log( data2 );
				
					if ( data2.code != 0 ) 
					{
						setMessage( 'Error: '+ data2.msg, 'danger' );
						return;
					}
					setMessage( 'Got code', 'success' );
					
					addCode( data2.data );
				});
			}, 5000);
		} );
	});
	
	// handle the learn call
	
});