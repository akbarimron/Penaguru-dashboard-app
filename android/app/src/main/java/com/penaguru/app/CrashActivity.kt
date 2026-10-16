package com.penaguru.app

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.util.TypedValue
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast

class CrashActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val errorText = intent.getStringExtra("CRASH_ERROR") ?: "Terjadi kesalahan tidak terduga."

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(Color.parseColor("#0F172A"))
      setPadding(40, 56, 40, 40)
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    val title = TextView(this).apply {
      text = "PenaGuru Terhenti"
      setTextColor(Color.parseColor("#F43F5E"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
      setTypeface(null, Typeface.BOLD)
      setPadding(0, 0, 0, 8)
    }
    root.addView(title)

    val subtitle = TextView(this).apply {
      text = "Berikut detail error penyebab aplikasi force close:"
      setTextColor(Color.parseColor("#94A3B8"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
      setPadding(0, 0, 0, 20)
    }
    root.addView(subtitle)

    val copyBtn = Button(this).apply {
      text = "Salin Teks Error"
      setBackgroundColor(Color.parseColor("#0F766E"))
      setTextColor(Color.WHITE)
      setOnClickListener {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("PenaGuru Crash Log", errorText))
        Toast.makeText(this@CrashActivity, "Detail error berhasil disalin!", Toast.LENGTH_SHORT).show()
      }
    }
    root.addView(copyBtn)

    val scrollView = ScrollView(this).apply {
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        0,
        1f
      ).apply { setMargins(0, 24, 0, 0) }
    }

    val errorView = TextView(this).apply {
      text = errorText
      setTextColor(Color.parseColor("#F1F5F9"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
      setTextIsSelectable(true)
      typeface = Typeface.MONOSPACE
    }
    scrollView.addView(errorView)
    root.addView(scrollView)

    setContentView(root)
  }
}
