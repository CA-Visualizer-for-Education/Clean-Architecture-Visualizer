## Time Management

My goals for the week:

- [x] Catch-up learning journals for weeks 4 and 5
- [x] Setup global styling for fonts and colours or similar
- [ ] Extract out any existing embedded styling
- [ ] Extract out any hardcoded data
- [ ] Setup the learning mode page
- [ ] Setup the header
- [ ] Setup the CA diagram pages
- [ ] Research UI testing

I unexpectedly ran into issues running the CLI on Windows, so I spent a considerable portion of time helping Vithu fix and test the issue on Windows (since everyone else runs MacOS). I was also hindered in my progress by not having much merged into main, which made it difficult to find a good branch I could start working from. 

In setting up global styling, I did make some progress towards the learning mode page by making a reusable component that will be used in the CA diagram. 

## Design Decisions
I spent a good amount of time playing around with the colours from our Figma design to make sure we had the right variations to meet contrast requirements. The component colours were made a bit lighter to allow black text to be used on all of them, and dark versions of the colours were introduced to be used as text colour on a white background. 
<img width="1918" height="871" alt="image" src="https://github.com/user-attachments/assets/5a09f03c-4d67-425f-abdd-4945fc45fe51" />

I made use of https://webaim.org/resources/contrastchecker/ to check colour contrast (shared by Vithu), as well as the built-in accessibility checker when you inspect a website on Chrome. 

I also made a page that shows all the style variables that were defined to give others guidelines on what had been defined and the variable names to use. This included an example of what the CA diagram will look like, and code:
<img width="1916" height="615" alt="image" src="https://github.com/user-attachments/assets/9f82ecc8-113f-4a92-8514-1a9b17f63b1d" />

Style variables were defined using relative units for the most part, to help make the page responsive. 

<img width="871" height="852" alt="image" src="https://github.com/user-attachments/assets/bc6b4fb4-75ea-4c6c-8b33-99acce9bcf16" />


