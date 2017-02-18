package com.demo.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.protocol.HTTP;

/**
 * http请求调用
 * 
 * @author caixb
 *
 */
public class HttpRequestUtil {
	/**
	 * 发送http请求(get方式)
	 * @param url  请求地址
     * @return  String
     * 
	 * **/
	@SuppressWarnings("deprecation")
	public static String doHttpRequestByGet(String url){
		if(StringUtils.isBlank(url)){
			return null;
		}
		try {
			HttpClient client = new DefaultHttpClient();
			client.getParams().setParameter(CoreProtocolPNames.HTTP_CONTENT_CHARSET, "utf-8");
			HttpGet httpGet = new HttpGet(url);
			HttpResponse response = client.execute(httpGet);
			InputStream is = response.getEntity().getContent();
			StringBuffer sb = new StringBuffer();
			byte[] b = new byte[1024];
			int len = 0;
			while ((len = is.read(b)) > 0) {
				sb.append(new String(b,0,len));
			}
			return sb.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return "";
	}
	
	/**  
     * 发送http请求(post方式)
     * @param url  请求地址
     * @param params 参数集合  
     * @return  String
     */  
    @SuppressWarnings("deprecation")
	public static String dohttpRequestByPost(String url,Map<String, String> params) {  
    	if(StringUtils.isBlank(url)){
			return null;
		}
        try {  
            //设置客户端编码  
            DefaultHttpClient httpclient = new DefaultHttpClient();
            httpclient.getParams().setParameter("http.protocol.content-charset",HTTP.UTF_8);  
            httpclient.getParams().setParameter(HTTP.CONTENT_ENCODING, HTTP.UTF_8);  
            httpclient.getParams().setParameter(HTTP.CHARSET_PARAM, HTTP.UTF_8);  
            httpclient.getParams().setParameter(HTTP.DEFAULT_PROTOCOL_CHARSET,HTTP.UTF_8);  
            
            // Post请求  
            HttpPost httppost = new HttpPost(url);
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(10000).setConnectTimeout(10000).build();//设置请求和传输超时时间
            httppost.setConfig(requestConfig);
            //设置post编码  
            httppost.getParams().setParameter("http.protocol.content-charset",HTTP.UTF_8);  
            httppost.getParams().setParameter(HTTP.CONTENT_ENCODING, HTTP.UTF_8);  
            httppost.getParams().setParameter(HTTP.CHARSET_PARAM, HTTP.UTF_8);  
            httppost.getParams().setParameter(HTTP.DEFAULT_PROTOCOL_CHARSET, HTTP.UTF_8);  
            
            // 设置参数  
            List<NameValuePair> paramList = new ArrayList<NameValuePair>();  
            //提交参数及值
 			for (String key : params.keySet()) {
 				paramList.add(new BasicNameValuePair(key,params.get(key)));
 			}
             httppost.setEntity(new UrlEncodedFormEntity(paramList, HTTP.UTF_8));   
            //设置报文头  
            // httppost.setHeader("Content-Type", "text/xml;charset=UTF-8");  
            // 发送请求  
            HttpResponse httpresponse = httpclient.execute(httppost);  
            // 获取返回数据  
            HttpEntity entity = httpresponse.getEntity(); 
            StringBuffer str = new StringBuffer();
			if (entity != null) {
				String line;
                InputStream is = entity.getContent();
                Reader reader = new InputStreamReader(is, "UTF-8");  
               //增加缓冲功能  
                BufferedReader bufferedReader = new BufferedReader(reader);  
                while ((line = bufferedReader.readLine()) != null) {  
                	str.append(line);  
                }  
                if (bufferedReader != null) {  
                	bufferedReader.close();  
                }  
                String content = str.toString();  
                //下面读取会有问题。。。。。。。。。。。。。
//                byte b[] = new byte[1024];
//                int i = 0;
//                while((i = is.read(b)) != -1){
//                	str.append(new String(b, 0, i));
//                }  
                entity.consumeContent();
                return content;
            }
        } catch (Exception e) {  
            e.printStackTrace();  
        }
        return "";  
    }
    
    /**
	 * 发送http请求(以流的方式写数据)
	 * @param url
	 * @param data
	 * @return
	 */
	public static String doHttpRequest(String url,String data){
		try{  
            // Configure and open a connection to the site you will send the request  
            URL myUrl = new URL(url);  
            URLConnection urlConnection = myUrl.openConnection();  
            // 设置doOutput属性为true表示将使用此urlConnection写入数据  
            urlConnection.setDoOutput(true);  
            // 定义待写入数据的内容类型，我们设置为application/x-www-form-urlencoded类型  
           // application/json; charset=utf-8
            urlConnection.setRequestProperty("application/json", "charset=utf-8");
           // urlConnection.setRequestProperty("Content-type", "application/octest-stream");
            //urlConnection.setRequestProperty("content-type", "application/x-www-form-urlencoded"); 
            // 得到请求的输出流对象  

            OutputStreamWriter out = new OutputStreamWriter(urlConnection.getOutputStream(),"UTF-8");  
            // 把数据写入请求的Body  
            out.write(data);  
            out.flush();  
            out.close();  
              
            // 从服务器读取响应  
            InputStream inputStream = urlConnection.getInputStream();  
            String body = IOUtils.toString(inputStream, "utf-8");  
            return body;
        }catch(IOException e){
        	e.printStackTrace();
        }
		return null;
	}
}
