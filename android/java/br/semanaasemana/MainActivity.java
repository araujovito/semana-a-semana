package br.semanaasemana;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Casca minima: uma WebView que abre o app guardado em assets. Toda a logica esta em app/app.js. */
public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true); // localStorage: e onde os registros ficam
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient()); // habilita alert() e confirm()
        web.addJavascriptInterface(new Ponte(), "Android");
        setContentView(web);
        if (estado == null) web.loadUrl("file:///android_asset/index.html");
        else web.restoreState(estado);
    }

    @Override
    protected void onSaveInstanceState(Bundle estado) {
        super.onSaveInstanceState(estado);
        web.saveState(estado);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    /** Funcoes que o JavaScript chama como window.Android.compartilhar(...) e window.Android.copiar(...). */
    private class Ponte {
        @JavascriptInterface
        public void compartilhar(String texto) {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, texto);
            startActivity(Intent.createChooser(i, "Compartilhar"));
        }

        @JavascriptInterface
        public void copiar(String texto) {
            ClipboardManager c = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            c.setPrimaryClip(ClipData.newPlainText("Semana a Semana", texto));
        }
    }
}
