/*
 *
 * Diff(git) to HTML
 * Author: rtfpessoa
 * Date: Friday 29 August 2014
 *
 */

var exInput = 'diff --git a/conf/load-analysis.conf b/conf/load-analysis.conf\n' +
'new file mode 100644\n' +
'index 0000000..b170d2b\n' +
'--- /dev/null\n' +
'+++ b/conf/load-analysis.conf\n' +
'@@ -0,0 +1,5 @@\n' +
'+include "load-master-analysis.conf"\n' +
'+\n' +
'+\n' +
'+# if should manage tasks\n' +
'+codacy.isTaskManager=false\n' +
'diff --git a/conf/load-master-analysis.conf b/conf/load-master-analysis.conf\n' +
'new file mode 100644\n' +
'index 0000000..53e049f\n' +
'--- /dev/null\n' +
'+++ b/conf/load-master-analysis.conf\n' +
'@@ -0,0 +1,26 @@\n' +
'+include "load.conf"\n' +
'+\n' +
'+# Sockets\n' +
'+# ~~~~~\n' +
'+codacy.sockets.remote=true\n' +
'+codacy.sockets.url="http://load.codacy.com/socket/notify"\n' +
'+\n' +
'+# enables the analysis server to run\n' +
'+codacy.isAnalysisServer=true\n' +
'+# if should manage analysis server work\n' +
'+codacy.isServerManager.active=false\n' +
'+# if should manage tasks\n' +
'+codacy.isTaskManager=true\n' +
'+\n' +
'+\n' +
'+# enables the repositoryListener to run\n' +
'+codacy.isRepositoryListener=true\n' +
'+#enables the payment system pooling for stripe payments\n' +
'+codacy.payments.active=false\n' +
'+\n' +
'+#third party\n' +
'+codacy.thirdPartyNotification.akka.active=true\n' +
'+codacy.thirdPartyNotification.users.active=false\n' +
'+\n' +
'+# DB values\n' +
'+db.default.hikaricp.file="conf/database/hikaricp.production-server.properties"\n' +
'diff --git a/conf/load-website.conf b/conf/load-website.conf\n' +
'new file mode 100644\n' +
'index 0000000..aa43adb\n' +
'--- /dev/null\n' +
'+++ b/conf/load-website.conf\n' +
'@@ -0,0 +1,26 @@\n' +
'+include "load.conf"\n' +
'+\n' +
'+# Sockets\n' +
'+# ~~~~~\n' +
'+codacy.sockets.remote=false\n' +
'+codacy.sockets.url=""\n' +
'+\n' +
'+# enables the analysis server to run\n' +
'+codacy.isAnalysisServer=false\n' +
'+# if should manage analysis server work\n' +
'+codacy.isServerManager.active=true\n' +
'+# if should manage tasks\n' +
'+codacy.isTaskManager=false\n' +
'+\n' +
'+\n' +
'+# enables the repositoryListener to run\n' +
'+codacy.isRepositoryListener=false\n' +
'+#enables the payment system pooling for stripe payments\n' +
'+codacy.payments.active=true\n' +
'+\n' +
'+#third party\n' +
'+codacy.thirdPartyNotification.akka.active=false\n' +
'+codacy.thirdPartyNotification.users.active=true\n' +
'+\n' +
'+#DB values\n' +
'+db.default.hikaricp.file="conf/database/hikaricp.production-website.properties"\n' +
'diff --git a/conf/load.conf b/conf/load.conf\n' +
'new file mode 100644\n' +
'index 0000000..8463b41\n' +
'--- /dev/null\n' +
'+++ b/conf/load.conf\n' +
'@@ -0,0 +1,27 @@\n' +
'+include "application.conf"\n' +
'+include "auth/integration.conf"\n' +
'+include "payments/test.conf"\n' +
'+include "actors/production.conf"\n' +
'+\n' +
'+# Application configuration\n' +
'+# ~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
'+application.mode=prod\n' +
'+\n' +
'+#Prevents integration from sending emails. DO NOT CHANGE\n' +
'+mail.debug=true\n' +
'+\n' +
'+# Codacy\n' +
'+# ~~~~~\n' +
'+codacy.js.extension=".js"\n' +
'+codacy.keys.location="/data/codacy/keys/"\n' +
'+codacy.repository.location="/data/codacy/repos/"\n' +
'+codacy.secure=false\n' +
'+codacy.algorithms.location="public/javascripts/_engine/_algos/"\n' +
'+\n' +
'+codacy.url="http://load.codacy.com"\n' +
'+\n' +
'+db.default.maxActive=20\n' +
'+\n' +
'+db.default.url="jdbc:postgresql://loaddb.codacy.com:5432/codacy"\n' +
'+db.default.user="codacy"\n' +
'+db.default.password="codacy"';

function generatePrettyDiff( diffInput ) {
  var diffHtml = "";
  var diffFiles = splitByFile( diffInput );

  for ( var file in diffFiles ) {
    diffHtml += "<h2>" + file + "</h2>" +
                "<div class=\"file-diff\">" +
                  "<div>" +
                    markUpDiff( diffFiles[ file ] ) +
                  "</div>" +
                "</div>";
  }

  return diffHtml;
}

function splitByFile( diffInput ) {
	var filename,
		isEmpty = true;
		files = {};

	diffInput.split( "\n" ).forEach(function( line, i ) {
		// Unmerged paths, and possibly other non-diffable files
		// https://github.com/scottgonzalez/pretty-diff/issues/11
		if ( !line || line.charAt( 0 ) === "*") {
			return;
		}

		if ( line.charAt( 0 ) === "d" ) {
			isEmpty = false;
			filename = line.replace( /^diff --git a\/(\S+) b\/(\S+).*$/, "$2" );
			files[ filename ] = [];
		} else if ( line.indexOf( "diff --git" ) === 0 ||
                line.indexOf( "new file mode" ) === 0 ||
                line.indexOf( "index" ) === 0 ||
                line.indexOf( "---" ) === 0 ||
                line.indexOf( "+++" ) === 0) {
      return;
    } else {
      files[ filename ].push( line );
    }
	});

	return isEmpty ? null : files;
}

var markUpDiff = function () {
	var diffClasses = {
		"d": "file",
		"i": "file",
		"@": "info",
		"-": "delete",
		"+": "insert",
		" ": "context"
	};

	function escape( str ) {
		return str
			.replace( /&/g, "&amp;" )
			.replace( /</g, "&lt;" )
			.replace( />/g, "&gt;" )
			.replace( /\t/g, "    " );
	}

	return function( diff ) {
		return diff.map(function( line ) {
			var type = line.charAt( 0 );
			return "<pre class=\"" + diffClasses[ type ] + "\">" + escape( line ) + "</pre>";
		}).join( "\n" );
	};
}();
