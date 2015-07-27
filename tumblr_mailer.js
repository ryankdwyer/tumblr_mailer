var fs = require('fs');
var ejs = require('ejs');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('KEY');
var tumblr_url = 'ryankdwyer.tumblr.com';

// Read in the email template and csv file of contacts
var csvFile = fs.readFileSync('friend_list.csv', 'utf8');
var email_template = fs.readFileSync('email_template.html', 'utf8');
// Authenticate via OAuth
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'KEY',
  consumer_secret: 'KEY',
  token: 'KEY',
  token_secret: 'KEY'
});

// Mandrill email variables
var from = 'Ryan Dwyer';
var from_email = 'ryankdwyer@gmail.com';
var subject = 'Blog Posts';

// This function adds an object to an array
function addObject(line, arr, headers) {
	var obj = {};
	line.forEach(function(curr, idx) {
		obj[headers[idx]] = curr;
	});
	return arr.push(obj);
}

// Handles csv prep - removes headers and saves them
function filePrep(csvFile) {
	csvFile = csvFile.split('\n');
	var headers = csvFile[0].split(',');
	csvFile = csvFile.slice(1);
	return [csvFile, headers];
}

// Uses addObject and filePrep to parse a csv file
function csvParse(csvFile) {
	// This helper function returns an array
	// array[0]: file to be parsed (no headers)
	// array[1]: headers from the file to be parsed
	var data = filePrep(csvFile);
	// Initialize the output array
	var output = [];
	// Initialize the array to hold each line
	var line = [];
	// Cycle through the file to be parsed
	data[0].forEach(function(el){
		line = el.split(',');
		addObject(line, output, data[1]);
	});
	return output;
}

// Uses email template and a csv object to customize email templates
// returns an array
function ejsTemplateRenderer(template, data, posts){
	var output = [];
	data.forEach(function(el){
		output.push(ejs.render(template, 
			{ firstName: el.firstName,
			  numMonthsSinceContact: el.numMonthsSinceContact,
			  latestPosts: posts}));
	});
	return output;
}
// Finds latest posts based on a threshold given in days
function latestPost(posts, threshold) {
	var output = [];
	var date = new Date();
	var ms = (1000 * 60 * 60 * 24 * threshold);
	posts.forEach(function(el){
		var test_date = new Date(el.date);
		if (date - test_date < ms) {
			output.push(el);
		}
	});
	return output;
}

// Mandrill email function
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    console.log(message);
	    console.log(result);   
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}


client.posts(tumblr_url, function(err, blog){
	var latestPosts = latestPost(blog.posts, 50);
	var csv_data = csvParse(csvFile); // Array
	var custom_template = ejsTemplateRenderer(email_template, csv_data, latestPosts); // Array
	csv_data.forEach(function(el, idx){
		sendEmail(el.firstName + ' ' + el.lastName, 
				  el['emailAddress'], 
				  from, 
				  from_email, 
				  subject, 
				  custom_template[idx]);
	});
});