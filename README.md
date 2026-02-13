[comment]: # (You may find the following markdown cheat sheet useful: https://www.markdownguide.org/cheat-sheet/. You may also consider using an online Markdown editor such as StackEdit or makeareadme.) 

## Project title: AI-Enhanced Symptom Management System

### Student name: Vrushali Hippargi

### Student email: vvh2@student.le.ac.uk

### Project description: 
This project focuses on the development of a supportive health platform designed for individuals with suspected Chronic Traumatic Encephalopathy (CTE) and their care networks. The primary objective is to reduce the cognitive burden of medical documentation by allowing patients to record their daily well-being through an AI-driven "brain dump" interface. By leveraging Natural Language Processing, the system automatically extracts and categorizes symptoms into five key health pillars (Mood, Behaviour, Sleep, Physical, and Cognitive). This structured data allows caregivers to monitor patient status through a collaborative timeline and facilitates the generation of weekly clinical summaries. By automating the transition from daily narrative to professional reporting, the app ensures that critical health data is accurately captured for medical consultations while simplifying the user experience for those with cognitive impairments.

### List of requirements (objectives): 

[comment]: # (You can add as many additional bullet points as necessary by adding an additional hyphon symbol '-' at the end of each list) 

Essential:

- AI-Driven "Brain Dump" Analysis: 
 - Patient Action: Ability to offload raw thoughts or symptoms into a simple, unstructured text interface.
 - System Action: Automatically parsing and tagging entries into the five health pillars using NLP.

- Collaborative Symptom Tracking:
 - Patient Action: View a chronological feed of their categorized symptoms to track personal trends.
 - Carer Action: Ability to view the shared timeline and add "Observation Notes" to provide a second perspective on the patient's status.

- Granular Access Control: 
 - Patient Action: Use a "Care Circle" dashboard to invite carers and toggle permissions for specific health pillars (e.g., sharing Physical data but keeping Mood private).
 - System Action: Enforcement of role-based permissions to ensure data privacy and patient-led sharing.

- Clinical Summary Exports: 
 - User Action: Ability to trigger the generation of a structured weekly PDF summary.
 - System Action: Compiling categorized data into a professional format suitable for medical consultations.


Desirable:

- Voice-to-Text Integration:
 - Patient Action: Ability to record audio "brain dumps" to minimize typing fatigue.
 - System Action: Converting voice recordings into text for AI analysis.

- Secure Care Circle Messaging: A real-time, text-based chat system for patients and authorized carers to coordinate care using Socket.io.

- Supporting Document Uploads: Secure storage and sharing of medical records, prescriptions, or scan results within the Care Circle.


Optional:

- Accessible Design (WCAG 2.1): Rigorous implementation of simplified UI and navigation standards for users with cognitive impairments. 
- NHS Integration Framework: Mapping internal data structures to FHIR standards to demonstrate potential for future NHS system integration. 
- Offline Entry: PWA functionality to allow symptom logging without an active internet connection.


## Information about this repository
This is the repository that you are going to use **individually** for developing your project. Please use the resources provided in the module to learn about **plagiarism** and how plagiarism awareness can foster your learning.

Regarding the use of this repository, once a feature (or part of it) is developed and **working** or parts of your system are integrated and **working**, define a commit and push it to the remote repository. You may find yourself making a commit after a productive hour of work (or even after 20 minutes!), for example. Choose commit message wisely and be concise.

Please choose the structure of the contents of this repository that suits the needs of your project but do indicate in this file where the main software artefacts are located.
