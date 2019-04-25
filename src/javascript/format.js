/*jslint node: true */
/*global settings, Intl, spacetime */

"use strict";

function Format() {

	/**
	 * Format numbers using the user selected format
	 * @param {int} n
	 * @param {string} format
	 * @return {string} n
	 */
	this.number = function number(n, format) {

		var regex = /(\d+)(\d{3})/,
			separator;

		if (format === '1,000') {
			separator = ',';

		} else if (format === '1 000') {
			separator = ' ';

		} else if (format === '1.000') {
			separator = '.';

		} else if (format === '1\'000') {
			separator = '\x27';
		}

		if (n >= 1000) {
			n = n.toString();

			while (regex.test(n)) {
				n = n.replace(regex, '$1' + separator + '$2');
			}
		}

		return n;

	};

	/**
	 * Convert 14 digit IA timestamps (YYYYMMDDhhmmss) into ISO 8601 format (YYYYMMDDTHHMMSSZ).
	 * @param {string} timeStamp API timestamp
	 * @return {string}
	 */
	this.timeStampToDate = function timeStampToDate(timeStamp) {

		return timeStamp.replace(
			/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
			'$1-$2-$3T$4:$5:$6Z'
		);

	};

	/**
	 * Format time stamp into a readable date format
	 * @return {string} output
	 * @param {string} customFormat Custom date format
	 * @return {string}
	 */
	this.readableDate = function readableDate(isoString, customFormat) {

		var d = spacetime(isoString),
			format = settings.get('dateFormat');
		
		if (customFormat) {
			format = customFormat;
		}
		
		if (settings.get('timeZoneConvert') === true) {
			d = d.goto(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		
		if (format === 'Y/m/d' || format === 'year/month/day') {
			return d.format('ymd');
		}
		
		if (format === 'd/m/Y' || format === 'day/month/year') {
			return d.format('dmy');
		}
		
		if (format === 'm/d/Y' || format === 'month/day/year') {
			return d.format('mdy');
		}

		// default -  April 04, 2018
		return d.format('month') + ' ' + d.format('date') + ', ' + d.format('year');

	};

	/**
	 * Format time stamp into a readable time format
	 * @param {string} dateString
	 * @param {boolean} convertTimeZone Convert to local time zone
	 * @param {string} format Time format
	 * @return {string} output
	 */
	this.readableTime = function readableTime(dateString, convertTimeZone, format) {
		format = format || null;

		var date,
			hour,
			min,
			sec,
			ap;

		if (typeof dateString !== 'undefined' || dateString !== null) {

			date = new Date(dateString);

			if (convertTimeZone === true) { // Convert to local timezone

				hour = date.getHours();
				min = date.getMinutes();
				sec = date.getSeconds();

			} else { // Use UTC

				hour = date.getUTCHours();
				min = date.getUTCMinutes();
				sec = date.getUTCSeconds();

			}

			// Add leading zero, if value is lees than 10
			if (min < 10) {
				min = '0' + min;
			}

			if (sec < 10) {
				sec = '0' + sec;
			}


			// 12 Hour clock
			if (format === 'g:i A' || format === 'g:i:s A') {

				ap = 'AM'; // Before midday

				if (hour > 12) { // If hour is greater than 12, remove 12 hours.

					hour -= 12;
					ap = "PM"; // Past midday

				} else if (hour === 0) { // If hour is 0 (midnight), change it to 12 (12:00 am).

					hour = 12;

				}

				// Add leading zero to hour, if it is not present after changing to the 12 hour clock.
				if (hour < 10) {
					hour = '0' + hour;
				}

				if (format === 'g:i A') { // Without seconds - g:i A - 02:50 (PM/AM)

					return hour + ':' + min + ' ' + ap;

				} else { // With seconds - g:i:s A - 02:50:48 (PM/AM)

					return hour + ':' + min + ':' + sec + ' ' + ap;

				}

			}

			// Add leading zero to hour
			if (hour < 10) {
				hour = '0' + hour;
			}

			// 24 Hour clock: H:i - 14:50
			if (format === 'H:i') {

				return hour + ':' + min;

			}

			// H:i:s - 14:50:48
			if (format === 'H:i:s') {

				return hour + ':' + min + ':' + sec;

			}

			return 'Invalid date or time format';

		}

	};

	/**
	 * Format time stamp to a time ago string. example: "1 hour ago"
	 * @param {string} dateString
	 * @param {bool} convertTimeZone Convert to local time zone
	 * @return {string} output
	 */
	this.timeSince = function timeSince(dateString, convertTimeZone) {

		if (convertTimeZone === undefined) {
			convertTimeZone = false;
		}

		var date,
			seconds,
			interval;

		if (convertTimeZone === true) { // Convert UTC to local timezone

			date = new Date(dateString);

		} else {

			// Remove UTC 'Z' time zone designator
			dateString = dateString.slice(0, -1);
			date = new Date(dateString);

		}

		seconds = Math.floor((new Date() - date) / 1000);
		interval = Math.floor(seconds / 31536000);

		if (interval > 1) {
			return interval + " years ago";
		}

		interval = Math.floor(seconds / 2592000);

		if (interval > 1) {
			return interval + " months ago";
		}

		interval = Math.floor(seconds / 86400);

		if (interval > 1) {
			return interval + " days ago";
		}

		interval = Math.floor(seconds / 3600);

		if (interval === 1) {
			return interval + " hour ago";
		}

		if (interval > 1) {
			return interval + " hours ago";
		}

		interval = Math.floor(seconds / 60);

		if (interval === 1) {
			return interval + " minute ago";
		}

		if (interval > 1) {
			return interval + " minutes ago";
		}

		return Math.floor(seconds) + " seconds ago";

	};

}
