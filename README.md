# tumblr_mailer
This script performs several functions: 
1. Parse .csv files of contacts. A header row is assumed. The function will perform on an arbitrary number of columns and rows. 
2. Render custom email templates using the ejs module.
3. Find the most recent blog posts from a tumblr page and insert them programmatically into the custom email templates. 
4. Send emails based on the .csv file of contacts and the custom made email templates.
