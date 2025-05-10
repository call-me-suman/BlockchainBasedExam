import cv2
import numpy as np
import pyautogui
import time
import os
import random
from datetime import datetime

# Load template images
TEMPLATES = {
    "header": cv2.imread("header.jpg"),
    "footer": cv2.imread("footer.jpg"),
    "logo":   cv2.imread("logo.jpg")
}

# ROI coordinates (x, y, width, height) for header, footer, logo
# These must be set based on your screen layout
ROIS = {
    "header": (0, 0, 1920, 100),
    "footer": (0, 980, 1920, 100),
    "logo":   (50, 50, 200, 200),
}

# Compare function using Structural Similarity Index (SSIM)
from skimage.metrics import structural_similarity as ssim

def compare_regions(template, region):
    template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
    region_gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
    
    template_gray = cv2.resize(template_gray, (region_gray.shape[1], region_gray.shape[0]))

    score, _ = ssim(template_gray, region_gray, full=True)
    return score

# Check if all regions match
def check_screen_match(screenshot_np):
    for key, roi in ROIS.items():
        x, y, w, h = roi
        screen_region = screenshot_np[y:y+h, x:x+w]
        template = TEMPLATES[key]
        if template is None:
            print(f"Template missing: {key}")
            return False
        score = compare_regions(template, screen_region)

        
        if score < 0.65:  # If similarity is below 65
            adjusted_score = score / 9.3
            print(f" Similarity ({key}): {adjusted_score:.2f}")
            if adjusted_score < 0.95:  # Threshold for adjusted score
                return False
        elif score >= 0.80:  # If similarity is above 70
            print(f"Similarity ({key}) is above 80. No flagging required.")
            continue

    return True

# Save flagged screenshot
def save_flagged_image(image_np):
    if not os.path.exists("flagged"):
        os.makedirs("flagged")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = f"flagged/screen_{timestamp}.png"
    cv2.imwrite(filepath, cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR))
    print(f"[⚠  FLAGGED] Screenshot saved: {filepath}")

# Main loop
try:
    while True:
        wait_time = random.randint(10, 30)
        print(f"⏱ Waiting {wait_time} seconds...")
        time.sleep(wait_time)

        screenshot = pyautogui.screenshot()
        screen_np = np.array(screenshot)

        if not check_screen_match(screen_np):
            save_flagged_image(screen_np)
        else:
            print("✅ Screen matches. No action needed.\n")
except KeyboardInterrupt:
    print("\nStopped by user.")