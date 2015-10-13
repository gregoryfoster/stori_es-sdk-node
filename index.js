// -- stori_es -- //
'use strict';

// --- MODULES --- //
var https = require('https');
var querystring = require('querystring');


// --- PROPERTIES --- ///
Stori_es.prototype.usage = "usage: var x = new Stori_es({ host: 'x.y.z', api_key: 'xyz', debug: [true|false] })";
Stori_es.prototype.config = { debug: false };


// --- CONSTRUCTOR --- //
function Stori_es( configuration ){
  // Validate configuration
  if( !configuration ){
    console.error(usage);
    throw usage;
  } else {
    if( !configuration.host || !configuration.api_key ){
      console.error(usage);
      throw usage;
    }
  }

  if( !(this instanceof Stori_es) ){
    return new Stori_es(configuration);
  }

  // Merge configuration properties
  for( var property_name in configuration ){
    this.config[property_name] = configuration[property_name];
  }
}

module.exports = Stori_es;


// --- FUNCTIONS --- //
Stori_es.prototype.performRequest = function( method, endpoint, data, success ){
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'BASIC ' + this.config.api_key
  };

  if( method == 'GET' ) {
    if( data )  endpoint += '?' + querystring.stringify(data);
    headers['Cache-Control'] = 'no-cache';
  }
  else {
    headers['Content-Length'] = data ? JSON.stringify(data).length : 0;
  }

  var options = {
    hostname: this.config.host,
    path: endpoint,
    method: method,
    headers: headers,
    debug: this.config.debug
  };

  var request = https.request(options, function( response ){
    var responseBody = '';
    response.setEncoding('utf-8');

    response.on('data', function( data ){
      responseBody += data;
    });

    response.on('end', function(){
      if( response.statusCode == 200 ){
        var json = JSON.parse(responseBody);
        if( options.debug )   console.log('  * ' + json.meta.status + ' [ HTTP/1.1 ' + json.meta.http_code + ' ] ' + endpoint);
        if( options.debug )  console.log(responseBody);
        success(json);
      } else {
        console.error('  - ERROR [ HTTP/1.1 ' + response.statusCode + ' ] ' + endpoint);
        success(null);
      }
    });
  });

  request.on('error', function( e ){
    console.error(e);
  });

  if( data ) request.write(JSON.stringify(data));
  request.end();
}
