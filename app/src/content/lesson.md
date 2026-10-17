---
title: Loops and Lists
date: 17/10/26
---

# Starter - Do Now
Draw a flow chart that keeps taking in a number until the user enters a number that is a multiple of 10.

---

<!-- template: title -->
# Loops and Lists
LO: To create for loops and while loops

---

# For Loops

:::space{size=large}
:::

:::space{size=large}
:::


```python live filename="loops.py"
nums = [12, 16, 292, 832]
for n in nums:
  print(n)
```

---

# While Loops

---

# for loop v. while loop

---

<!-- template: content -->

# Villains Total Salary

1. Output the list of villains and their salary:
    - Thanos: £5000
    - Dr. Doom: £3000
    - Doc Ock: £850
    - Ultron: £1300

:::space{size=large}
:::

```python live filename="villains.py"

```

:::solution
villains = ["Thanos", "Dr. Doom", "Doc Ock", "Ultron"]
salaries = [5000, 3000, 850, 1300]

for counter in range(len(villains)):
    print(villains[counter], " earns £", salaries[counter])
:::
