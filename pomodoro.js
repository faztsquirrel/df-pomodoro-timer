(function() {
	var edit = document.getElementById("sync-timer-edit");
	var text = document.getElementById("sync-timer-text");
	var audio = document.getElementById("sync-timer-audio");
	var clear = document.getElementById("sync-timer-clear");
	var reset = document.getElementById("sync-timer-reset");
	var button = document.getElementById("sync-timer-button");
	var selector = document.getElementById("sync-timer-selector");

	/*********************\
	    timer:
		0 = Timer Off
		1 = Timer On
	\*********************/
	var mode = 1;
	/********************\
	    stage:
		0 = Countdown
		1 = Wait for input  
		2 = Break
		3 = Ready to start
	\********************/
	var stage = 3;
	var date_start = null;
	var pause_start = null;
	var pause_compensation = 0;

	// Enable Notifications
	Notification.requestPermission();

	function switch_mode() {
		if(mode == 0) {
			pause_compensation = ((new Date()) - pause_start);

			button.innerHTML = '<span title="Pause timer" class="typcn typcn-media-pause"></span>';

			mode = 1;
		} else if(mode == 1) {
			pause_start = new Date();

			button.innerHTML = '<span title="Start timer" class="typcn typcn-media-play"></span>';

			mode = 0;
		}

		update();
	}

	function switch_task(e) {
		for(var i = 0; i < selector.children.length; i++) {
			selector.children[i].className = "";
		}

		e.target.parentElement.className = "active";
	}

	function reset_timer(e) {
		mode = 1;
		stage = 3;

		switch_mode();
	}
	
	reset.addEventListener(
		"click",
		reset_timer
	)

	function clear_tasks(e) {
		var state = JSON.parse(localStorage.getItem("state"));

		state.history = [];

		localStorage.setItem("state", JSON.stringify(state));

		update_tasks();
	}

	clear.addEventListener(
		"click",
		clear_tasks
	)

	function edit_tasks(e) {
		var state = JSON.parse(localStorage.getItem("state"));

		var names = prompt(
			"Comma Seperated List",
			state.tasks.join(",")
		);

		if(names != null) {
			state.tasks = names.split(",");
			localStorage.setItem("state", JSON.stringify(state));
		}

		update_tasks();
	}

	edit.addEventListener(
		"click",
		edit_tasks
	)

	function switch_audio(e) {
		var state = JSON.parse(localStorage.getItem("state"));
		state.muted = !state.muted;
		localStorage.setItem("state", JSON.stringify(state));

		if(!state.muted) {
			audio.innerHTML = 
				'<span title="Sounds unmuted" class="typcn typcn-volume-up"></span>';
		} else {
			audio.innerHTML = 
				'<span title="Sounds muted" class="typcn typcn-volume-mute"></span>';
		}
	}

	audio.addEventListener(
		"click",
		switch_audio
	)

	switch_audio();
	switch_audio();

	function time_since(date) {
		return Math.round((
				(
					((new Date()) - date - pause_compensation) % 86400000
				) % 3600000) 
			/ 60000);
	}

	function update() {
		if(mode == 0) {
			if(stage == 0 || stage == 2) {
				text.innerHTML = "Timer is paused";
			} else if(stage == 3) {
				text.innerHTML = "Timer is off";
			}
		} else if(mode == 1) {
			if(stage == 0) {
				var minutes = 25 - time_since(date_start);

				if(minutes <= 0) {
					switch_mode();
					stage = 1;

					new Notification("Pomodoro Timer", {
						body: "Pomodoro over, take a break!",
						icon: "android-chrome-512x512.png"
					});

					var state = JSON.parse(localStorage.getItem("state"));

					if (!state.muted) (new Audio('beep.wav')).play();

					state.history.push({
						start: date_start, 
						task: document.getElementById("sync-timer-selector")
							.getElementsByClassName("active")[0].children[0].innerHTML,
						end: new Date()
					});
					localStorage.setItem("state", JSON.stringify(state));

					text.innerHTML = "Pomodoro over";

					update_tasks();
				} else {
					text.innerHTML = minutes + " Minutes of work left";
				}
			} else if(stage == 1) {
				stage = 2;
				date_start = new Date();
				pause_compensation = 0;

				update();
			} else if(stage == 2) {
				var minutes = 5 - time_since(date_start);

				if(minutes <= 0) {
					switch_mode();
					stage = 3;

					new Notification("Pomodoro Timer", {
						body: "Break over, back to work!",
						icon: "android-chrome-512x512.png"
					});

					var state = JSON.parse(localStorage.getItem("state"));
					if (!state.muted) (new Audio('beep.wav')).play();

					text.innerHTML = "Break over";
				} else {
					text.innerHTML = "Break! " + minutes + " Minutes left";
				}
			} else if(stage == 3) {
				stage = 0;
				date_start = new Date();
				pause_compensation = 0;

				update();
			}
		}
	}

	setInterval(update, 1000);

	button.addEventListener(
		"click",
		switch_mode
	)

	switch_mode();

	{
		function update_tasks() {
			var old_state = localStorage.getItem("state");

			if(old_state == null) {
				old_state = {
					muted: true,
					tasks: ["Research", "Work", "Documentation"],
					history: []
				};

				localStorage.setItem("state", JSON.stringify(old_state));
			} else {
				old_state = JSON.parse(old_state);
			}

			selector.innerHTML = "";

			for(var i = 0; i < old_state.tasks.length; i++) {
				selector.innerHTML += 
				"<li><button>" + old_state.tasks[i] + "</button></li>";
			}

			selector.children[0].className = "active";

			for(var i = 0; i < selector.children.length; i++) {
				selector.children[i].children[0].addEventListener(
					"click",
					switch_task
				)
			}

			function date_to_text(date) {
				function pad(n, j) {
					var output = new String(n);
					for(var i = output.length; i < j; i++) {
						output = "0" + output;
					}
					return output;
				}

				return pad(date.getFullYear(), 4) + "-" + 
					pad(date.getMonth(), 2) + "-" +
					pad(date.getDay(), 2) + " " +
					pad(date.getHours(), 2) + ":" +
					pad(date.getMinutes(), 2);
			}

			for(var i = 0; i < old_state.history.length; i++) {
				var start = date_to_text(new Date(old_state.history[i].start));
				var task = old_state.history[i].task;
				var end =	date_to_text(new Date(old_state.history[i].end));
				
				document.getElementById("sync-timer-table").innerHTML =
				"<tr><td>" + start + "</td><td>"+ end +"</td><td>" + task + 
				"</td></tr>" + 
				document.getElementById("sync-timer-table").innerHTML;
			}
		}

		update_tasks();

		if ('serviceWorker' in navigator) {
			window.addEventListener('load', function() {
			  navigator.serviceWorker.register('service_worker.js').then(
			  	function(registration) {
				    console.log('ServiceWorker registration successful');
				  }, function(err) {
				    console.log('ServiceWorker registration failed: ', err);
				  });
			});
		}
	}
})();