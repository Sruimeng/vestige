---
id: style-hemingway
type: reference
related_ids: [doc-standard, constitution]
---

# Hemingway Style Guide

The Style Law. High Signal, Low Noise.

## Core Types

```typescript
interface StyleRule {
  principle: string
  constraint: string[]
  example?: CodeExample
}

interface CodeExample {
  bad: string
  good: string
}
```

## Iceberg Principle

Show through types, not comments. Let structure tell the story. Hide complexity below the surface.

**Constraints:**
- Types ARE documentation
- Comments explain WHY, never WHAT
- If code needs explanation, refactor it

## No Fluff

Cut everything that does not advance logic.

**Naming:**
- `getUserDataFromDatabase` -> `getUser`
- `isUserLoggedInToSystem` -> `isLoggedIn`
- `handleButtonClickEvent` -> `onClick`

**Comments to DELETE:**
- `// loop through items`
- `// check if valid`
- `// return the result`

**Meta-talk to DELETE:**
- "In this section, we will..."
- "The following code demonstrates..."
- "As mentioned above..."

## Forbidden Patterns

### Bureaucratic Suffixes

```
Manager, Impl, Factory, Helper, Util, Service, Handler, Processor
```

Rename or restructure.

### Deep Nesting

Max 3 levels. Use early returns.

```typescript
// BAD
function process(data) {
  if (data) {
    if (data.valid) {
      if (data.items) {
        return data.items.map(transform)
      }
    }
  }
}

// GOOD
function process(data) {
  if (!data?.valid) return null
  if (!data.items) return []
  return data.items.map(transform)
}
```

### Verbose Conditionals

```typescript
// BAD
if (user !== null && user !== undefined) {
  if (user.isActive === true) {
    return user
  }
}
return null

// GOOD
if (!user?.isActive) return null
return user
```

## Code Examples

### Function Naming

```typescript
// BAD
function getUserDataFromDatabaseById(userId: string) {
  // Check if user exists
  if (userId) {
    // Fetch user from database
    return db.users.find(userId)
  }
}

// GOOD
function getUser(id: string) {
  if (!id) return null
  return db.users.find(id)
}
```

### Component Structure

```typescript
// BAD
function UserProfileDisplayComponent({ userData }) {
  // Render user profile
  return (
    <div className="user-profile-container-wrapper">
      {/* User name section */}
      <span>{userData.name}</span>
    </div>
  )
}

// GOOD
function UserProfile({ user }) {
  return (
    <div className="profile">
      <span>{user.name}</span>
    </div>
  )
}
```

## Checklist

Before commit, verify:

- [ ] No "what" comments
- [ ] No bureaucratic suffixes
- [ ] Max 3 nesting levels
- [ ] Function names < 20 chars
- [ ] No meta-talk in docs
