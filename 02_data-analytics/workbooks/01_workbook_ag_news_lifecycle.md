# In-Class Workbook: Data Analytics Lifecycle + AI (5 minutes)

Paste this into a Google Colab cell and run it. We'll load a small news
dataset, look at it, then let a pretrained AI model try to classify a
headline itself.

```python
!pip install "huggingface_hub<1.0"
from datasets import load_dataset

ds = load_dataset("ag_news", split="train[:500]")
labels = ["World", "Sports", "Business", "Sci/Tech"]

print(ds[0])
print("Features:", ds.column_names)
```

**Question:** which column is a *feature* (the input) and which is the
*target* (what we're predicting)?

Your answer: _______________________

## Task 1: Check the label distribution

Fill in the blank to count how many examples fall into each category.

```python
import pandas as pd

df = ds.to_pandas()
df["label_name"] = df["label"].map(lambda i: labels[i])

# TODO: count rows per label_name
counts = ___________________________
counts.plot(kind="bar")
```

<details>
<summary>💡 Answer</summary>

```python
counts = df["label_name"].value_counts()
```

</details>

Is the dataset balanced across the four categories, or skewed?

## Task 2: Let a pretrained model guess the category

Run this on a few headlines and compare the model's guess to the real
label — no training involved, just inference with a model that's never
seen this exact dataset.

```python
!pip install --upgrade "huggingface_hub<1.0" transformers
from transformers import pipeline

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

for i in [0, 1, 2]:
    text = df.loc[i, "text"]
    true_label = df.loc[i, "label_name"]
    result = classifier(text, candidate_labels=labels)
    predicted = result["labels"][0]
    print(f"True: {true_label:10s} | Predicted: {predicted:10s} | {text[:60]}")
```

Did the model agree with the true label every time? Try changing the
`i` values above to a couple of your own picks — can you find one the
model gets wrong?

## Discussion (1–2 minutes)

We just walked the full loop: **question → data → exploration →
visualization → AI insight**. Where did the AI step (zero-shot
classification) save us time compared to writing rules by hand for
"which words mean Sports vs. Business"?
