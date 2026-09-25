# In-Class Workbook: Numerical Data + Regression (5 minutes)

Paste this into a Google Colab cell and run it. We'll use the California
Housing dataset — one row per neighborhood, with the median home value as
the target.

```python
from sklearn.datasets import fetch_california_housing
import pandas as pd

data = fetch_california_housing(as_frame=True)
df = data.frame

print(df.head())
print("Features:", list(data.feature_names))
print("Target:", data.target_names)
```

**Question:** name two of the features. What's the target we're trying
to predict?

Your answer: _______________________

## Task 1: Check a relationship

Fill in the blank to see how median income (`MedInc`) relates to the
target, `MedHouseVal`.

```python
# TODO: make a scatter plot of MedInc (x) vs MedHouseVal (y)
df.plot.___________________________(x="MedInc", y="MedHouseVal", alpha=0.2)
```

<details>
<summary>💡 Answer</summary>

```python
df.plot.scatter(x="MedInc", y="MedHouseVal", alpha=0.2)
```

</details>

Does higher income roughly track with higher home value? Any outliers
that jump out?

## Task 2: Fit a tiny regression

Run this to fit a one-feature linear regression and check how far off a
prediction is.

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X = df[["MedInc"]]
y = df["MedHouseVal"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

print("R^2 on test set:", model.score(X_test, y_test))

# Predict for a neighborhood with median income of $80,000 (value is in $10k units, so 8.0)
sample_income = [[8.0]]
print("Predicted median home value ($100k units):", model.predict(sample_income))
```

R² is between 0 and 1 — roughly, the fraction of the variation in home
value that `MedInc` alone explains. Is this a strong or weak predictor by
itself?

## Discussion (1–2 minutes)

We used just **one** feature (`MedInc`) to predict home value. What other
columns in `df` might improve the prediction if we added them to `X`?
