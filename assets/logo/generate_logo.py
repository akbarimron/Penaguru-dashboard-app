import os
import subprocess
from PIL import Image

SKILL_DIR = r"C:\Users\akbar\Downloads\logo-design-skill-main\logo-design-skill-main\skills\logo-design"
RENDER_SCRIPT = os.path.join(SKILL_DIR, "scripts", "render_png.py")
AUDIT_SCRIPT = os.path.join(SKILL_DIR, "scripts", "svg_audit.py")

os.makedirs("assets/logo", exist_ok=True)
os.makedirs("src/assets/logo", exist_ok=True)

# -------------------------------------------------------------
# 1. PenaGuru Mark (Pure Monochrome White - for gradient/dark)
# -------------------------------------------------------------
# Designed on a 256x256 canvas with golden ratio proportions.
# Combines:
# 1) Fountain Pen Nib (Pena) pointing upward with sleek shoulders.
# 2) Open Book Pages (Guru/Ilmu) forming the dynamic base wings.
# 3) Four-pointed Guiding Star (Bintang Pembimbing) as the breather hole.
# 4) Slit and negative space cleanly cut out with evenodd winding.
svg_mark_white = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title">
  <title id="title">PenaGuru Brand Mark</title>
  <!-- Unified silhouette with crisp negative space cuts for slit, guiding star, and book fold -->
  <path fill="#FFFFFF" fill-rule="evenodd" d="
    M 128 36
    C 127 36 125 38 123 41
    C 107 72 85 116 68 144
    C 62 154 60 165 65 176
    L 76 198
    C 79 204 85 207 91 205
    C 103 201 117 193 128 182
    C 139 193 153 201 165 205
    C 171 207 177 204 180 198
    L 191 176
    C 196 165 194 154 188 144
    C 171 116 149 72 133 41
    C 131 38 129 36 128 36 Z
    
    M 126 48
    L 126 108
    C 122 108 116 112 114 116
    C 118 121 122 124 122 128
    C 122 132 118 135 114 140
    C 118 144 122 148 126 148
    L 126 172
    C 120 176 108 184 94 188
    L 86 172
    C 82 164 83 156 88 148
    C 102 124 122 84 126 48 Z

    M 130 48
    C 134 84 154 124 168 148
    C 173 156 174 164 170 172
    L 162 188
    C 148 184 136 176 130 172
    L 130 148
    C 134 148 138 144 142 140
    C 138 135 134 132 134 128
    C 134 124 138 121 142 116
    C 140 112 134 108 130 108
    L 130 48 Z
  "/>
  <!-- Central Radiant Guiding Star Core -->
  <path fill="#FFFFFF" d="
    M 128 114
    Q 128 128 114 128
    Q 128 128 128 142
    Q 128 128 142 128
    Q 128 128 128 114 Z
  "/>
</svg>'''

# -------------------------------------------------------------
# 2. PenaGuru Mark (Full Vibrant Brand Color)
# -------------------------------------------------------------
svg_mark_color = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="titleColor">
  <title id="titleColor">PenaGuru Color Mark</title>
  <defs>
    <!-- Left Wing Gradient (Cyan into Royal Blue) -->
    <linearGradient id="pgLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="60%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    
    <!-- Right Wing Gradient (Electric Indigo into Royal Purple) -->
    <linearGradient id="pgRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="60%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>

    <!-- Golden Guiding Star Gradient -->
    <linearGradient id="pgStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>

    <!-- Subtle Drop Glow -->
    <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#F59E0B" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Left Pen Nib Body & Book Page Wing -->
  <path fill="url(#pgLeftGrad)" d="
    M 126 36
    C 125 36 123 38 121 41
    C 105 72 83 116 66 144
    C 60 154 58 165 63 176
    L 74 198
    C 77 204 83 207 89 205
    C 102 201 116 193 126 181
    L 126 148
    C 121 146 117 141 113 138
    C 117 133 121 129 121 128
    C 121 127 117 123 113 118
    C 117 115 121 110 126 108
    Z
  "/>

  <!-- Right Pen Nib Body & Book Page Wing -->
  <path fill="url(#pgRightGrad)" d="
    M 130 36
    C 131 36 133 38 135 41
    C 151 72 173 116 190 144
    C 196 154 198 165 193 176
    L 182 198
    C 179 204 173 207 167 205
    C 154 201 140 193 130 181
    L 130 148
    C 135 146 139 141 143 138
    C 139 133 135 129 135 128
    C 135 127 139 123 143 118
    C 139 115 135 110 130 108
    Z
  "/>

  <!-- Inner Soft Book Page Folds (Depth) -->
  <path fill="#FFFFFF" fill-opacity="0.18" d="
    M 128 92
    L 94 172
    C 106 177 118 174 128 166
    C 138 174 150 177 162 172
    Z
  "/>

  <!-- Central Radiant Golden Star of Wisdom (Guru) -->
  <path fill="url(#pgStarGrad)" filter="url(#starGlow)" d="
    M 128 112
    Q 128 128 112 128
    Q 128 128 128 144
    Q 128 128 144 128
    Q 128 128 128 112 Z
  "/>
</svg>'''

# -------------------------------------------------------------
# 3. PenaGuru App Icon Badge (Squircle + Glow)
# -------------------------------------------------------------
svg_mark_squircle = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="titleApp">
  <title id="titleApp">PenaGuru App Icon</title>
  <defs>
    <radialGradient id="sqBg" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="45%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </radialGradient>
    <linearGradient id="sqStar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>

  <!-- Squircle Base (Apple iOS / Modern Android curvature) -->
  <rect x="8" y="8" width="240" height="240" rx="56" fill="url(#sqBg)"/>
  <rect x="8" y="8" width="240" height="240" rx="56" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>

  <!-- PenaGuru Mark scaled neatly inside squircle -->
  <g transform="translate(16, 16) scale(0.875)">
    <!-- White Silhouetted Nib with dynamic negative space -->
    <path fill="#FFFFFF" fill-rule="evenodd" d="
      M 128 36
      C 127 36 125 38 123 41
      C 107 72 85 116 68 144
      C 62 154 60 165 65 176
      L 76 198
      C 79 204 85 207 91 205
      C 103 201 117 193 128 182
      C 139 193 153 201 165 205
      C 171 207 177 204 180 198
      L 191 176
      C 196 165 194 154 188 144
      C 171 116 149 72 133 41
      C 131 38 129 36 128 36 Z
      
      M 126 50 L 126 108
      C 122 108 116 112 114 116
      C 118 121 122 124 122 128
      C 122 132 118 135 114 140
      C 118 144 122 148 126 148
      L 126 172
      C 120 176 108 184 94 188
      L 86 172
      C 82 164 83 156 88 148
      C 102 124 122 84 126 50 Z

      M 130 50
      C 134 84 154 124 168 148
      C 173 156 174 164 170 172
      L 162 188
      C 148 184 136 176 130 172
      L 130 148
      C 134 148 138 144 142 140
      C 138 135 134 132 134 128
      C 134 124 138 121 142 116
      C 140 112 134 108 130 108
      L 130 50 Z
    "/>
    <!-- Golden Star Spark -->
    <path fill="url(#sqStar)" d="
      M 128 114
      Q 128 128 114 128
      Q 128 128 128 142
      Q 128 128 142 128
      Q 128 128 128 114 Z
    "/>
  </g>
</svg>'''

# -------------------------------------------------------------
# 4. PenaGuru Horizontal Lockup (Light Header: Blue mark + Ink typography)
# -------------------------------------------------------------
svg_horizontal_color = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="460" height="110" role="img" aria-labelledby="titleLockupColor">
  <title id="titleLockupColor">PenaGuru Logo</title>
  <defs>
    <linearGradient id="hzLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="60%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="hzRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="60%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="hzStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>

  <!-- Left Mark (scaled to 88x88) -->
  <g transform="translate(10, 11) scale(0.344)">
    <path fill="url(#hzLeftGrad)" d="
      M 126 36 C 125 36 123 38 121 41 C 105 72 83 116 66 144 C 60 154 58 165 63 176 L 74 198 C 77 204 83 207 89 205 C 102 201 116 193 126 181 L 126 148 C 121 146 117 141 113 138 C 117 133 121 129 121 128 C 121 127 117 123 113 118 C 117 115 121 110 126 108 Z
    "/>
    <path fill="url(#hzRightGrad)" d="
      M 130 36 C 131 36 133 38 135 41 C 151 72 173 116 190 144 C 196 154 198 165 193 176 L 182 198 C 179 204 173 207 167 205 C 154 201 140 193 130 181 L 130 148 C 135 146 139 141 143 138 C 139 133 135 129 135 128 C 135 127 139 123 143 118 C 139 115 135 110 130 108 Z
    "/>
    <path fill="url(#hzStarGrad)" d="
      M 128 112 Q 128 128 112 128 Q 128 128 128 144 Q 128 128 144 128 Q 128 128 128 112 Z
    "/>
  </g>

  <!-- Typography: PenaGuru -->
  <text x="110" y="64" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="38" font-weight="800" fill="#0F172A" letter-spacing="-0.8">Pena<tspan fill="#4F46E5">Guru</tspan></text>
  <text x="112" y="86" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="12" font-weight="600" fill="#64748B" letter-spacing="1.2">RUANG KERJA PENDIDIK</text>
</svg>'''

# -------------------------------------------------------------
# 5. PenaGuru Horizontal Lockup (Dark/Gradient Header: Pure White)
# -------------------------------------------------------------
svg_horizontal_white = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="460" height="110" role="img" aria-labelledby="titleLockupWhite">
  <title id="titleLockupWhite">PenaGuru Logo White</title>
  <!-- Left Mark White -->
  <g transform="translate(10, 11) scale(0.344)">
    <path fill="#FFFFFF" fill-rule="evenodd" d="
      M 128 36 C 127 36 125 38 123 41 C 107 72 85 116 68 144 C 62 154 60 165 65 176 L 76 198 C 79 204 85 207 91 205 C 103 201 117 193 128 182 C 139 193 153 201 165 205 C 171 207 177 204 180 198 L 191 176 C 196 165 194 154 188 144 C 171 116 149 72 133 41 C 131 38 129 36 128 36 Z
      M 126 50 L 126 108 C 122 108 116 112 114 116 C 118 121 122 124 122 128 C 122 132 118 135 114 140 C 118 144 122 148 126 148 L 126 172 C 120 176 108 184 94 188 L 86 172 C 82 164 83 156 88 148 C 102 124 122 84 126 50 Z
      M 130 50 C 134 84 154 124 168 148 C 173 156 174 164 170 172 L 162 188 C 148 184 136 176 130 172 L 130 148 C 134 148 138 144 142 140 C 138 135 134 132 134 128 C 134 124 138 121 142 116 C 140 112 134 108 130 108 L 130 50 Z
    "/>
    <path fill="#FDE047" d="
      M 128 114 Q 128 128 114 128 Q 128 128 128 142 Q 128 128 144 128 Q 128 128 128 114 Z
    "/>
  </g>

  <!-- Typography: PenaGuru White -->
  <text x="110" y="64" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="38" font-weight="800" fill="#FFFFFF" letter-spacing="-0.8">Pena<tspan fill="#38BDF8">Guru</tspan></text>
  <text x="112" y="86" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.85)" letter-spacing="1.2">RUANG KERJA PENDIDIK</text>
</svg>'''

files = {
    "assets/logo/penaguru-mark-white.svg": svg_mark_white,
    "assets/logo/penaguru-mark-color.svg": svg_mark_color,
    "assets/logo/penaguru-mark-squircle.svg": svg_mark_squircle,
    "assets/logo/penaguru-logo-horizontal-color.svg": svg_horizontal_color,
    "assets/logo/penaguru-logo-horizontal-white.svg": svg_horizontal_white,
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    # also copy to src/assets/logo/
    dest = os.path.join("src", path)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {path} and {dest}")

print("All SVG logos generated successfully!")
