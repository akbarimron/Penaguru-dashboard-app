import os
from PIL import Image, ImageDraw

def create_circle_crop(img):
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, w, h), fill=255)
    result = img.copy()
    result.putalpha(mask)
    return result

def make_adaptive_foreground(src_img, size):
    # Android adaptive icon standard: 108dp canvas with 66-72dp safe zone in center (~62%)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    logo_size = int(size * 0.62)
    logo_resized = src_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (size - logo_size) // 2
    canvas.paste(logo_resized, (offset, offset), logo_resized)
    return canvas

def make_splash(src_img, width=1242, height=2436):
    canvas = Image.new('RGBA', (width, height), (255, 255, 255, 255))
    logo_size = int(min(width, height) * 0.32)
    logo_resized = src_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = ((width - logo_size) // 2, (height - logo_size) // 2)
    canvas.paste(logo_resized, offset, logo_resized)
    return canvas

def main():
    color_mark_path = 'assets/logo/penaguru-mark-color.png'
    squircle_path = 'assets/logo/penaguru-mark-squircle.png'

    if not os.path.exists(color_mark_path) or not os.path.exists(squircle_path):
        print(f"Error: logo files not found!")
        return

    color_mark = Image.open(color_mark_path).convert('RGBA')
    squircle = Image.open(squircle_path).convert('RGBA')

    os.makedirs('assets', exist_ok=True)

    # 1. assets/icon.png (1024x1024)
    icon_1024 = squircle.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_1024.save('assets/icon.png', 'PNG')
    print("Created assets/icon.png")

    # 2. assets/adaptive-icon.png (Adaptive foreground, 1024x1024 with centered safe zone)
    adaptive_1024 = make_adaptive_foreground(color_mark, 1024)
    adaptive_1024.save('assets/adaptive-icon.png', 'PNG')
    print("Created assets/adaptive-icon.png")

    # 3. assets/favicon.png (Web favicon, 192x192)
    fav = squircle.resize((192, 192), Image.Resampling.LANCZOS)
    fav.save('assets/favicon.png', 'PNG')
    print("Created assets/favicon.png")

    # 4. assets/splash.png
    splash = make_splash(color_mark)
    splash.save('assets/splash.png', 'PNG')
    print("Created assets/splash.png")

    # 5. Native Android icons in android/app/src/main/res/
    android_res = 'android/app/src/main/res'
    if os.path.exists(android_res):
        densities = {
            'mipmap-mdpi': (48, 108),
            'mipmap-hdpi': (72, 162),
            'mipmap-xhdpi': (96, 216),
            'mipmap-xxhdpi': (144, 324),
            'mipmap-xxxhdpi': (192, 432),
        }

        for folder, (launcher_sz, fore_sz) in densities.items():
            dir_path = os.path.join(android_res, folder)
            os.makedirs(dir_path, exist_ok=True)

            # ic_launcher.webp
            l_img = squircle.resize((launcher_sz, launcher_sz), Image.Resampling.LANCZOS)
            l_img.save(os.path.join(dir_path, 'ic_launcher.webp'), 'WEBP')

            # ic_launcher_round.webp
            r_img = create_circle_crop(l_img)
            r_img.save(os.path.join(dir_path, 'ic_launcher_round.webp'), 'WEBP')

            # ic_launcher_foreground.webp
            f_img = make_adaptive_foreground(color_mark, fore_sz)
            f_img.save(os.path.join(dir_path, 'ic_launcher_foreground.webp'), 'WEBP')

            print(f"Updated Android {folder} ({launcher_sz}px launcher, {fore_sz}px foreground)")

        # Splash screen logo in drawable-* (Android 12+ SplashScreen API: 288dp canvas, ~160dp centered icon)
        drawable_multipliers = {
            'drawable-mdpi': 1.0,
            'drawable-hdpi': 1.5,
            'drawable-xhdpi': 2.0,
            'drawable-xxhdpi': 3.0,
            'drawable-xxxhdpi': 4.0,
        }
        for d_folder, mult in drawable_multipliers.items():
            d_dir = os.path.join(android_res, d_folder)
            os.makedirs(d_dir, exist_ok=True)
            canvas_sz = int(288 * mult)
            logo_sz = int(156 * mult)
            sp_canvas = Image.new('RGBA', (canvas_sz, canvas_sz), (0, 0, 0, 0))
            sp_logo = color_mark.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS)
            offset = (canvas_sz - logo_sz) // 2
            sp_canvas.paste(sp_logo, (offset, offset), sp_logo)
            sp_canvas.save(os.path.join(d_dir, 'splashscreen_logo.png'), 'PNG')
            print(f"Updated {d_folder}/splashscreen_logo.png ({canvas_sz}px canvas, {logo_sz}px logo)")

    print("All app icons successfully generated!")

if __name__ == '__main__':
    main()
