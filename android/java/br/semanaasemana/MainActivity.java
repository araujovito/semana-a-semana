package br.semanaasemana;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.provider.CalendarContract;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Calendar;
import java.util.TimeZone;

/** Casca mínima: uma WebView que abre o app guardado em assets. Toda a lógica está nos arquivos de app/. */
public class MainActivity extends Activity {
    private static final String INICIO = "file:///android_asset/index.html";
    private WebView web;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true); // localStorage: é onde os registros ficam
        // A página só precisa dos próprios arquivos (file:///android_asset/ abre mesmo com o acesso a arquivos desligado).
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setGeolocationEnabled(false);
        s.setSaveFormData(false);
        web.setWebViewClient(new WebViewClient() {
            // Nada navega para fora dos arquivos do app.
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                return !r.getUrl().toString().startsWith("file:///android_asset/");
            }
        });
        web.setWebChromeClient(new WebChromeClient()); // habilita alert() e confirm()
        web.addJavascriptInterface(new Ponte(), "Android");
        web.setBackgroundColor(getColor(R.color.fundo));
        setContentView(web);
        if (estado == null || web.restoreState(estado) == null) web.loadUrl(INICIO);
    }

    @Override
    protected void onSaveInstanceState(Bundle estado) {
        super.onSaveInstanceState(estado);
        web.saveState(estado);
    }

    /**
     * O sistema trocou entre modo claro e escuro com o app aberto. A Activity não é recriada (configChanges tem uiMode),
     * para a tela não recarregar no meio de um formulário; as cores da janela são reaplicadas aqui. As cores vêm de
     * values/ e values-night/, e a página troca sozinha pelo CSS (prefers-color-scheme).
     */
    @Override
    public void onConfigurationChanged(Configuration nova) {
        super.onConfigurationChanged(nova);
        Window w = getWindow();
        w.setStatusBarColor(getColor(R.color.barra_status));
        w.setNavigationBarColor(getColor(R.color.barra_navegacao));
        w.setBackgroundDrawableResource(R.color.fundo);
        web.setBackgroundColor(getColor(R.color.fundo));
        View d = w.getDecorView();
        int f = d.getSystemUiVisibility();
        boolean clara = getResources().getBoolean(R.bool.barra_navegacao_clara);
        d.setSystemUiVisibility(clara ? f | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : f & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
    }

    /**
     * Botão voltar: quem decide é a página, em window.aoVoltar() (app/inicio.js). Ela fecha o diálogo ou a folha aberta ou volta
     * para a aba Hoje e devolve "ficar"; devolve "sair" quando já está na aba Hoje e o app deve sair. Se a página não tiver a
     * função (ou não tiver carregado), voltar sai do app. testes/fluxo-aparelho.js roda este mesmo trecho de JavaScript.
     */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(function(){try{return typeof aoVoltar==='function'?String(aoVoltar()):'sair'}catch(e){return 'sair'}})()", r -> {
            if (r == null || "null".equals(r) || "\"sair\"".equals(r)) MainActivity.super.onBackPressed();
        });
    }

    /** Funções que o JavaScript chama como window.Android.compartilhar(...), window.Android.copiar(...) e window.Android.calendario(...). */
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

        /**
         * Abre o app de calendário do celular com um evento semanal de dia inteiro já preenchido, começando na data dada
         * (AAAA-MM-DD). Quem grava é ela, no calendário; o app não pede permissão de calendário e não lê nada de lá.
         * Devolve false se a data for inválida ou se o celular não tiver app de calendário.
         */
        @JavascriptInterface
        public boolean calendario(String data) {
            try {
                if (data == null || !data.matches("\\d{4}-\\d{2}-\\d{2}")) return false;
                // Evento de dia inteiro: o calendário espera a meia-noite em UTC.
                Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
                c.clear();
                c.setLenient(false);
                c.set(Integer.parseInt(data.substring(0, 4)), Integer.parseInt(data.substring(5, 7)) - 1, Integer.parseInt(data.substring(8, 10)));
                long inicio = c.getTimeInMillis();
                Intent i = new Intent(Intent.ACTION_INSERT, CalendarContract.Events.CONTENT_URI);
                i.putExtra(CalendarContract.Events.TITLE, getString(R.string.evento_aplicacao));
                i.putExtra(CalendarContract.EXTRA_EVENT_ALL_DAY, true);
                i.putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, inicio);
                i.putExtra(CalendarContract.EXTRA_EVENT_END_TIME, inicio + 24 * 60 * 60 * 1000L);
                i.putExtra(CalendarContract.Events.RRULE, "FREQ=WEEKLY");
                // Em tarefa separada: se o app de calendário falhar ao abrir, ele não derruba este app junto (visto no emulador).
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                return true;
            } catch (Exception e) { // ActivityNotFoundException (sem app de calendário) ou data impossível
                return false;
            }
        }
    }
}
