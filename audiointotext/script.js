                                <script>
                                    var langs =
                                        [['عربى', ['ar-DZ', 'Algeria'],
                                            ['ar-BH', 'Bahrain'],
                                            ['ar-TD', 'Chad'],
                                            ['ar-KM', 'Comoros'],
                                            ['ar-DJ', 'Djibouti'],
                                            ['ar-EG', 'Egypt'],
                                            ['ar-IQ', 'Iraq'],
                                            ['ar-JO', 'Jordan'],
                                            ['ar-KW', 'Kuwait'],
                                            ['ar-LB', 'Lebanon'],
                                            ['ar-LY', 'Libya'],
                                            ['ar-MR', 'Mauritania'],
                                            ['ar-MA', 'Morocco'],
                                            ['ar-OM', 'Oman'],
                                            ['ar-PS', 'State of Palestine'],
                                            ['ar-QA', 'Qatar'],
                                            ['ar-SA', 'Saudi Arabia'],
                                            ['ar-SO', 'Somalia'],
                                            ['ar-SD', 'Sudan'],
                                            ['ar-SY', 'Syria'],
                                            ['ar-AE', 'United Arab Emirates'],
                                            ['ar-YE', 'Yemen'],
                                            ['ar-TN', 'Tunisia']],];


                                    for (var i = 0; i < langs.length; i++) {
                                        select_language.options[i] = new Option(langs[i][0], i);
                                    }
                                    select_language.selectedIndex = 0;
                                    updateCountry();
                                    select_dialect.selectedIndex = 0;
                                    showInfo('info_start');

                                    function updateCountry() {
                                        for (var i = select_dialect.options.length - 1; i >= 0; i--) {
                                            select_dialect.remove(i);
                                        }
                                        var list = langs[select_language.selectedIndex];
                                        for (var i = 1; i < list.length; i++) {
                                            select_dialect.options.add(new Option(list[i][1], list[i][0]));
                                        }
                                        select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
                                    }

                                    var create_email = false;
                                    var final_transcript = '';
                                    var recognizing = false;
                                    var ignore_onend;
                                    var start_timestamp;
                                    if (!('webkitSpeechRecognition' in window)) {
                                        upgrade();
                                    } else {
                                        start_button.style.display = 'inline-block';
                                        var recognition = new webkitSpeechRecognition();
                                        recognition.continuous = true;
                                        recognition.interimResults = true;

                                        recognition.onstart = function () {
                                            recognizing = true;
                                            showInfo('info_speak_now');
                                            start_img.src = "images/Mic2.gif";
                                        };

                                        recognition.onerror = function (event) {
                                            if (event.error == 'no-speech') {
                                                start_img.src = 'images/Mic-Static.png';
                                                showInfo('info_no_speech');
                                                ignore_onend = true;
                                            }
                                            if (event.error == 'audio-capture') {
                                                start_img.src = 'images/Mic-Static.png';
                                                showInfo('info_no_microphone');
                                                ignore_onend = true;
                                            }
                                            if (event.error == 'not-allowed') {
                                                if (event.timeStamp - start_timestamp < 100) {
                                                    showInfo('info_blocked');
                                                } else {
                                                    showInfo('info_denied');
                                                }
                                                ignore_onend = true;
                                            }
                                        };

                                        recognition.onend = function () {
                                            recognizing = false;
                                            if (ignore_onend) {
                                                return;
                                            }
                                            start_img.src = 'images/Mic-Static.png';
                                            if (!final_transcript) {
                                                showInfo('info_start');
                                                return;
                                            }
                                            showInfo('');
                                            if (window.getSelection) {
                                                window.getSelection().removeAllRanges();
                                                var range = document.createRange();
                                                range.selectNode(document.getElementById('final_span'));
                                                window.getSelection().addRange(range);
                                            }
                                            if (create_email) {
                                                create_email = false;
                                                createEmail();
                                            }
                                        };

                                        recognition.onresult = function (event) {
                                            var interim_transcript = '';
                                            if (typeof (event.results) == 'undefined') {
                                                recognition.onend = null;
                                                recognition.stop();
                                                upgrade();
                                                return;
                                            }
                                            for (var i = event.resultIndex; i < event.results.length; ++i) {
                                                if (event.results[i].isFinal) {
                                                    final_transcript += event.results[i][0].transcript;
                                                } else {
                                                    interim_transcript += event.results[i][0].transcript;
                                                }
                                            }
                                            final_transcript = capitalize(final_transcript);
                                            final_span.innerHTML = linebreak(final_transcript);
                                            interim_span.innerHTML = linebreak(interim_transcript);
                                            if (final_transcript || interim_transcript) {
                                                showButtons('inline-block');
                                            }
                                        };
                                    }

                                    function upgrade() {
                                        start_button.style.visibility = 'hidden';
                                        alert("upgrade");
                                        showInfo('info_upgrade');
                                    }

                                    var two_line = /\n\n/g;
                                    var one_line = /\n/g;
                                    function linebreak(s) {
                                        return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
                                    }

                                    var first_char = /\S/;
                                    function capitalize(s) {
                                        return s.replace(first_char, function (m) { return m.toUpperCase(); });
                                    }

                                    function copyButton() {
                                        if (recognizing) {
                                            recognizing = false;
                                            recognition.stop();
                                        }
                                        copy_info.style.display = 'inline-block';
                                        showInfo('');
                                    }

                                    function startButton(event) {
                                        if (recognizing) {
                                            recognition.stop();
                                            return;
                                        }
                                        final_transcript = '';
                                        recognition.lang = select_dialect.value;
                                        recognition.start();
                                        ignore_onend = false;
                                        final_span.innerHTML = '';
                                        interim_span.innerHTML = '';
                                        start_img.src = 'images/Mic-Stop1.png';
                                        showInfo('info_allow');
                                        showButtons('none');
                                        start_timestamp = event.timeStamp;
                                    }

                                    function showInfo(s) {
                                        if (s) {
                                            for (var child = info.firstChild; child; child = child.nextSibling) {
                                                if (child.style) {
                                                    child.style.display = child.id == s ? 'inline' : 'none';
                                                }
                                            }
                                            info.style.visibility = 'visible';
                                        } else {
                                            info.style.visibility = 'hidden';
                                        }
                                    }

                                    var current_style;
                                    function showButtons(style) {
                                        if (style == current_style) {
                                            return;
                                        }
                                        counter();
                                    }


                                    function myFunction() {

                                        data = final_transcript;
                                        $("#data").val(data);
                                        $("#my-form").submit();
                                    }

                                    //Reset Result
                                    function myFunction6() {
                                        document.getElementById("results").innerHTML = '';
                                        //document.getElementById("data").focus();
                                        document.getElementById('charCountNoSpace').innerHTML = 0;
                                        document.getElementById('wordCount').innerHTML = 0;
                                        document.getElementById('totalChars').innerHTML = 0;
                                        document.getElementById('charCount').innerHTML = 0;
                                    }

                                    function counter() {
                                        document.getElementById('my_button').style.visibility = "visible";
                                        document.getElementById('my_button2').style.visibility = "visible";

                                        var value = final_transcript;
                                        if (value.length == 0) {
                                            document.getElementById('wordCount').innerHTML = 0;
                                            document.getElementById('totalChars').innerHTML = 0;
                                            document.getElementById('charCount').innerHTML = 0;
                                            document.getElementById('charCountNoSpace').innerHTML = 0;
                                            return;
                                        }

                                        var regex = /\s+/gi;
                                        var wordCount = value.trim().replace(regex, ' ').split(' ').length;
                                        var totalChars = value.length;
                                        var charCount = value.trim().length;
                                        var charCountNoSpace = value.replace(regex, '').length;
                                        document.getElementById('charCountNoSpace').innerHTML = charCountNoSpace;
                                        document.getElementById('wordCount').innerHTML = wordCount;
                                        document.getElementById('totalChars').innerHTML = totalChars;
                                        document.getElementById('charCount').innerHTML = charCount;

                                    }

                                    function printTextArea() {
                                        childWindow = window.open('', 'childWindow', 'location=yes, menubar=yes, toolbar=yes');
                                        childWindow.document.open();
                                        childWindow.document.write('<html><head></head><body>');
                                        childWindow.document.write(final_transcript);
                                        childWindow.document.write('</body></html>');
                                        childWindow.print();
                                        childWindow.document.close();
                                        childWindow.close();
                                    }
                                    //Whatsapp
                                    function value_added() {
                                        var send_content = final_transcript;
                                        if (send_content !== '') {
                                            var url_link = '';
                                            var url = "https://web.whatsapp.com/send?text=" + send_content + url_link;
                                            document.getElementById('url_link').setAttribute("href", url);
                                        }
                                        //else{ alert("Please speaking first."); }
                                    }

                                </script>
