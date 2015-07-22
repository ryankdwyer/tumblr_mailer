var fs = require('fs');
var ejs = require('ejs');
var tumblr_url = 'ryankdwyer.tumblr.com'

// Read in the email template and csv file of contacts
var csvFile = fs.readFileSync('friend_list.csv', 'utf8');
var email_template = fs.readFileSync('email_template.html', 'utf8');
// Authenticate via OAuth
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: '0qE5EQpvpxhMTTQ2VqT7k3kd6s8WdNZAqL8c6VBr3MVwFH8MxU',
  consumer_secret: 'nJBu0Ab7ujxNI3tWM5YyqdER7B9Re0HdZoMN6wIAdbyrzis91Y',
  token: 'ForWAYUtTJRtn8zGHTbIsSOKvpgtbnzY8cQyl6NzDDD316J5Du',
  token_secret: 'uyiBgRLCF75W54pR3kDYtI1fOKMXnrORosiutQUqIgSdfF5kb8'
});

client.posts(tumblr_url, function(err, blog){
	var posts = blog.posts;
	posts = latestPost(posts, 50);
	var csv_data = csvParse(csvFile);
	var custom_template = ejsTemplateRenderer(email_template, csv_data, posts);
});
// This function adds an object to an array
function addObject(line, arr, headers) {
	var obj = {};
	line.forEach(function(curr, idx) {
		obj[headers[idx]] = curr
	})
	return arr.push(obj);
}

// Handles csv prep - removes headers and saves them
function filePrep(csvFile) {
	csvFile = csvFile.split('\n').slice(0,-1);
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
	})
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
	})
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
	})
	return output;
}