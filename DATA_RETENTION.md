Data Retention & Data Usage

This document describes the data collected by the Pi Profile Card application, how it is used, and how long it is retained.

User Data Overview
## User Data Overview

| Data Field       | Description                                   | Required | Publicly Visible        | Retention Policy |
|------------------|-----------------------------------------------|----------|-------------------------|------------------|
| Pi User ID       | Unique identifier provided by Pi Platform     | Yes      | No                      | Stored until account deletion |
| Nickname         | User-chosen display name                      | Yes      | Yes (if published)      | Stored until updated or account deletion |
| Bio              | Short user description                        | No       | Yes (if published)      | Stored until updated or account deletion |
| Avatar Image     | Optional profile image uploaded by the user   | No       | Yes (if published)      | Stored until updated or account deletion |
| External Links   | User-provided external URLs (https only)      | No       | Yes (if published)      | Stored until updated or account deletion |
| Profile Status   | Indicates whether the profile is published    | Yes      | Yes                     | Stored until account deletion |
| Abuse Reports    | Reports submitted by users for moderation     | No       | No                      | Retained for moderation and security purposes |

Data Collection Principles

Only the minimum data required to provide the service is collected

No sensitive personal data (such as email, phone number, address, or date of birth) is collected

All profile data is explicitly provided by the user (opt-in)

Users have full control over what information is made public

Data Visibility

Profile data is private by default

Profile data becomes public only after the user explicitly publishes the profile

Users can unpublish their profile at any time, immediately removing it from public access

Data Deletion & Export

Users may delete their account and all associated data at any time

Upon deletion, profile data and stored assets are permanently removed

Users may export their profile data in a machine-readable format upon request

Data Sharing

User data is not sold, rented, or shared with third parties

External links provided in profiles are user-controlled and optional

Data Security

Access to user data is restricted to the application backend

Reasonable technical and organizational measures are used to protect stored data
