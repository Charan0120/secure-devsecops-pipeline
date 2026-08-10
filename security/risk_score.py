import json

critical = 0
high = 0
medium = 0
low = 0

score = (
    critical * 10 +
    high * 7 +
    medium * 4 +
    low * 1
)

print(f"Security Risk Score: {score}")

if score > 50:
    print("BLOCK DEPLOYMENT")
    exit(1)

elif score > 20:
    print("WARNING")

else:
    print("PASS")