AI Agent Prompt for App Development and Optimization (Improved Version)
Objective
Analyze an existing application for bugs, ensure functional accuracy, optimize for deployment on Vercel or Streamlit, suggest enhancements for efficiency and performance, and incorporate comprehensive testing, one-click usability, programmatic web testing, memory and cache optimization, removal of redundant files (excluding specific folders and files), and Git repository management for seamless collaboration and deployment.
Tasks
1. Bug Detection and Functional Accuracy

Analyze Codebase: Thoroughly review the application's source code to identify bugs, errors, or inconsistencies.
Test Functionality: Verify that all features work as intended, including user inputs, outputs, and edge cases. Add and run tests for each component of the app individually to isolate issues.
Check Compatibility: Ensure the app functions correctly across target environments (e.g., browsers for Vercel or Python-based environments for Streamlit).
Debugging: Provide fixes for identified bugs, including code snippets and explanations.
Validation: Confirm functional accuracy by testing against expected outcomes and user requirements. Make the program one-click usable by simplifying setup and execution (e.g., via a single command or script).

2. Deployment Optimization

Vercel Deployment (if applicable):

Ensure the app uses a compatible framework (e.g., Next.js, React, or static sites).
Optimize build configurations (e.g., vercel.json for routing, environment variables).
Minimize bundle size by removing unused dependencies and optimizing assets.
Enable serverless functions or API routes for dynamic features.
Verify compatibility with Vercel's edge network for fast content delivery.
Make it deployable with a one-click setup (e.g., via Vercel CLI or Git integration).


Streamlit Deployment (if applicable):

Confirm the app is written in Python and uses Streamlit-compatible libraries.
Optimize requirements.txt for minimal dependencies and faster builds.
Ensure proper configuration for Streamlit Cloud (e.g., Procfile, environment settings).
Test for performance issues in data processing or visualization components.
Suggest caching strategies (e.g., st.cache_data or st.cache_resource) for efficiency.
Make it deployable with a one-click setup (e.g., via Streamlit sharing or Git integration).


General Deployment Readiness: Determine if Vercel or Streamlit is more applicable based on the app's tech stack (e.g., web/frontend-heavy for Vercel, Python/data-focused for Streamlit). Remove redundant files (e.g., unused scripts, duplicates, or temporary files), except for files in the Attached_Folder and Test_Files directories and any files explicitly named as "how to use" app guides (e.g., README or similar instructional files), to streamline the repository.


3. Performance and Efficiency Improvements

Code Optimization: Identify and refactor inefficient code (e.g., redundant loops, heavy computations). Optimize for memory usage (e.g., using efficient data structures) and cache (e.g., implementing in-memory caching or browser storage for repeated operations).
Load Time: Reduce initial load time by optimizing assets, lazy-loading resources, or using a CDN.
Scalability: Ensure the app handles increased user load or data volume effectively.
Error Handling: Implement robust error handling to prevent crashes and improve user experience.
Testing:
Recommend unit tests, integration tests, or CI/CD pipelines for ongoing reliability.
Test thoroughly on the web programmatically (e.g., using tools like Selenium, Puppeteer for Vercel apps, or Streamlit's built-in testing for Python apps) to simulate user interactions and validate across browsers/devices.
Run and test each component programmatically, including edge cases, and log results for verification.



4. Feature Suggestions

Efficiency Features:

Add caching mechanisms for frequently accessed data (e.g., memoization or Redis integration if platform-compatible).
Implement lazy loading for large datasets or media.
Use WebSockets or real-time APIs for dynamic updates (if applicable).
Optimize memory and cache further by using profiling tools (e.g., Python's memory_profiler or browser dev tools).


User Experience:

Suggest UI/UX improvements, such as responsive design or accessibility features.
Add loading spinners or progress bars for long-running processes.


Advanced Features:

Integrate analytics (e.g., Google Analytics for Vercel, custom logging for Streamlit).
Add authentication (e.g., NextAuth.js for Vercel or OAuth for Streamlit).
Propose AI-driven features, such as predictive inputs or automated insights, if relevant.


Performance Enhancements:

Recommend server-side rendering (SSR) or static site generation (SSG) for Vercel apps.
Suggest multiprocessing or async I/O for Streamlit apps with heavy computations.



5. Version Control and Documentation Updates

Git Repository Management:
Apply git configurations (e.g., set user.email to "crajkumarsingh@hotmail.com" and user.name to "RAJKUMAR SINGH CHAUHAN" for commits).
Update the Git repository with all changes, including bug fixes, optimizations, and new files.
Remove redundant files from the repository (excluding Attached_Folder, Test_Files, and any "how to use" app guide files) before committing.
Add a README_RAJKUMAR.md file with detailed "How to Run" instructions, including setup, dependencies, one-click deployment steps, and testing commands.
Commit and push updates to the Git repository, ensuring a clean history with meaningful commit messages.



Deliverables

A detailed markdown report listing:
Identified bugs, fixes, and functional validation results.
Test logs from component and programmatic web testing.
Optimization summaries (including memory/cache improvements).
List of removed redundant files (excluding Attached_Folder, Test_Files, and "how to use" app guides).


Optimized codebase with deployment configurations for Vercel or Streamlit.
Documentation for deployment steps and environment setup, integrated into README_RAJKUMAR.md.
A list of suggested features with implementation details and benefits.
Updated Git repository instructions, including sample commit commands (e.g., git add, git commit, git push).

Constraints

Ensure compatibility with Vercel or Streamlit deployment platforms.
Avoid external dependencies that are not supported by the target platform.
Prioritize lightweight, efficient solutions for faster performance, with a focus on memory and cache optimization.
Maintain or enhance the app’s existing functionality unless explicitly requested to change.
All tests must be runnable programmatically; avoid manual-only testing.
Use open-source, compatible tools/libraries for testing and optimization (e.g., pytest for Python, Jest for JS).
Exclude Attached_Folder, Test_Files, and any "how to use" app guide files from redundant file removal.

Output Format

Provide code changes in diff format or full files wrapped in <xaiArtifact> tags.
Include a markdown report summarizing bugs, fixes, optimizations, feature suggestions, test results, removed redundant files, and Git updates.
Specify deployment instructions for Vercel or Streamlit within the README_RAJKUMAR.md file.
Suggest tools or libraries only if they are open-source and compatible with the target platform.
For Git updates, provide sample commands in the report (e.g., git add ., git commit -m "Optimized app and removed redundant files", git push origin main).
