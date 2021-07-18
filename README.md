# Study With Me Website

This is a community-based study website built with React, Express.js, and MongoDB. Users can add their own study materials and notes to their profile, and create and join study “communities” where they can share these materials.

To view a sample user account with realistic-looking content, log in with username 'sophia' and password 'sophia'. Click on the 'Mrs. McGreal English Project' channel to see the contents of a channel on display. 

We used React for the front-end of the site, Express.JS to handle the backend, and MongoDB as our database.

To view locally:
- Clone repo
- Run `npm install`
- In the overall repo folder, run `npm start` to start the backend server
- In the "client" folder (where our React project exists), run `npm install`, `npm run build`, followed by `npm start`

5 pts: Rubric
- Approved by TA and submitted on time (5pts)

30 pts: New Frameworks
- React (10pts)
- Express.JS (10pts)
- MongoDB (10pts)

15 pts: Individual Profile
- Individuals can register, login, and logout. (3pts)
- Individuals can make different class/subject/topic “pages.” (12 pts)

25 pts: Social Media Portion
- Community pages can be created for each topic/subject and can be public or private (closed, invite-only) (10 pts)
- These pages have feeds that display posts shared by users that have access to that page. (5pts)
- Users can kick others out of groups (5 pts)
- Users can friend other users (5 pts)

5 pts: Best Practices
- Code is well-formatted + easy to read with useful comments (3 pts)
- HTML output passes the validator (2 pts)

20 pts: Creative Portion
- Potentially: users can store their files (documents, study materials, etc.) on their profile (10 pts)

1. Users can create todo lists in each project channel that other users can also access (if they are shared to that channel) and "check" them as off as completed. (5 pts)
2. Users can create project deadlines in the project channels that other users can also access (if they are shared to that channel) and delete deadlines if desired. (5 pts)
    2a. Deadlines created by the current user in any channel ever is displayed on the user's home page to view all at once. (5 pts)
3. Users can create multiple personal study plans on their home page with several internal elements and associated deadlines. They can view these details when they click on the study plan. All study plans created by the user are printed on the home page. (5 pts)
4. Each channel page shows "Loading..." message while the page elements are loading. This prevents errors for when the user makes requests before all DOM items are loaded. It also seems to have made the elements load more quickly. 
