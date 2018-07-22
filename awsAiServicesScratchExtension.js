/* 
Scratch Extension for AWS AI Services Polly and Translate
Created by Ceyhun OZGUN

https://github.com/ceyhunozgun/awsAIScratchExtension

Jul 2018
*/

new (function() {
	
	var ext = this;
	
	$.getScript('https://ceyhunozgun.github.io/awsAIScratchExtension/aws-sdk-2.270.1.js', initExtension);

	var accessKeyId = '';
	var secretAccessKey = '';

	var polly;
	var rekognition;
 
	var voice = 'Joanna';
	var language = 'English';
	var sourceLanguage = 'English';
	var targetLanguage = 'Spanish';
	
	var languages = {
		'English': {
			pollyVoice: 'Joanna',
			translateCode: 'en',
		},
		'Spanish': {
			pollyVoice: 'Penelope',
			translateCode: 'es',
		},
		'Turkish': {
			pollyVoice: 'Filiz',
			translateCode: 'tr',
		},
		'French': {
			pollyVoice: 'Lea',
			translateCode: 'fr',
		},
		'German': {
			pollyVoice: 'Vicki',
			translateCode: 'de',
		},
		'Italian': {
			pollyVoice: 'Carla',
			translateCode: 'it',
		}
	};
	
	var translatedText = '';
	var detectedText = '';

	function initAWS(region) {
		AWS.config.region = region;
		AWS.config.accessKeyId = accessKeyId;
		AWS.config.secretAccessKey = secretAccessKey;
	}
	
	function initPolly(region) {
		polly = new AWS.Polly({ region: region});
	}
	
	function initTranslate(region) {
		translate = new AWS.Translate({ region: region});
	}
	
		
	function playAudioFromUrl(url, finishHandler) {
		var audio = new Audio(url);
		audio.onended = function() {
			if (finishHandler)
				finishHandler();
		}
		audio.play();
	}

	function speak(txt, voiceId, callback) {
		var params = {
			OutputFormat: 'mp3',
			Text: txt,
			VoiceId: voiceId,
		};
		
		polly.synthesizeSpeech(params, function(err, data) {
			if (err)
				console.log(err, err.stack);
			else {
				var uInt8Array = new Uint8Array(data.AudioStream);
				var arrayBuffer = uInt8Array.buffer;
				var blob = new Blob([arrayBuffer]);
				var url = URL.createObjectURL(blob);
				
				playAudioFromUrl(url, callback);
			}
		});		
	}
	
	function translateText(text, sourceLang, targetLang, translationHandler) {
		var params = {
			Text: text,
			SourceLanguageCode: languages[sourceLang].translateCode,
			TargetLanguageCode: languages[targetLang].translateCode,
		};
		translate.translateText(params, function (err, data) {
			if (err) 
				console.log(err, err.stack);
			else
				translationHandler(data.TranslatedText);
		});
	}

	function initExtension() {
	}
	
	function initAWSServices(region) {
		initAWS(region);
		initPolly(region);
		initTranslate(region);
	}
	
	// Initialization services
	
	ext.initAWSServices = function(region) {
		if (accessKeyId === '')
			accessKeyId = prompt('Please enter your AWS_ACCESS_KEY_ID');
		if (secretAccessKey === '')
			secretAccessKey = prompt('Please enter your AWS_SECRET_ACCESS_KEY');
		
		initAWSServices(region);
	}


	// Polly services
	ext.setLanguage = function (lang) {
		language = lang;
		voice = languages[language].pollyVoice;
	};

	ext.speak = function (text, callback) {
		speak(text, voice, callback);
	};

	
	// Translate services
	ext.setSourceLanguage = function (lang) {
		sourceLanguage = lang;
	};
	
	ext.setTargetLanguage = function (lang) {
		targetLanguage = lang;
	};

	ext.translate = function (text, callback) {
		translateText(text, sourceLanguage, targetLanguage, function (txt) {
			translatedText = txt;
			callback();
		});
	};
	
	ext.getTranslatedText = function () {
		return translatedText;
	}
	
	ext._shutdown = function() {};

	ext._getStatus = function() {
		return {status: 2, msg: 'Ready'};
	};

	var descriptor = {
		blocks: [
			[' ', 'init AWS %s', 'initAWSServices', 'eu-west-1'],

			['-'],
			['-'],
						
			[' ', 'choose language %m.languages', 'setLanguage', 'English'],
			['w', 'say %s', 'speak', 'Hello from Amazon Web Services'],

			['-'],
			['-'],

			[' ', 'choose source language %m.sourceLanguages', 'setSourceLanguage', 'English'],
			[' ', 'choose target language %m.targetLanguages', 'setTargetLanguage', 'Spanish'],
			['w', 'translate %s', 'translate', 'Hello'],
			['r', 'translatedText', 'getTranslatedText']
		
		],
		menus: {
			languages: ['English', 'Spanish', 'Turkish', 'French', 'German', 'Italian'],
			sourceLanguages: ['English', 'Spanish', 'Turkish', 'French', 'German', 'Italian'],
			targetLanguages: ['English', 'Spanish', 'Turkish', 'French', 'German', 'Italian']
		},
	};

	ScratchExtensions.register('AWS AI Services', descriptor, ext);
})();