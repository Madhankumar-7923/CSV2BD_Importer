#FIRST STEP YOU HAVE TO DO
~ Open terminal(bash recommended) run the command 'npm install'
_________________________________________________________________________

#USE YOUR OWN DB AND SESSION CREDENTIALS
~ Create a file named '.env' in working directory
~ Inside the file paste the below text
~ (
   #MAIN SERVER PORT
   PORT = 3000

   #POSTGRESSQL DB CREDENTIALS
   DB_USER = 'YOUR DB USERNAME'
   DB_HOST = 'YOUR DB HOST'
   DB_DATABASE = 'YOUR DB DATABASE'
   DB_PASSWORD = 'YOUR DB PASSWORD'
   DB_PORT = 'YOUR DB PORT'

   #SESSION SECRET CODE
   SESSION_CODE = 'ANY CODE'
  )
~ Replace as your own crediantials.

_________________________________________________________________________

#HOW TO START THE SERVER 
~ Open terminal run the command 'npm start'
~ Use the browser and run the url 'https://localhost:3000'