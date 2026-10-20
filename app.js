// Shared helpers for index.html and log.html (same origin => same localStorage)
window.CAL=(function(){
  var KEY='calorielog.v1';
  // k=key, l=label, u=unit, dv=FDA daily value reference, lim=a "limit" nutrient (warn when over)
  var NUT=[
    {k:'calories',l:'Calories',u:'kcal'},
    {k:'protein',l:'Protein',u:'g',dv:50},
    {k:'carbs',l:'Carbohydrates',u:'g',dv:275},
    {k:'fat',l:'Total fat',u:'g',dv:78,lim:1},
    {k:'satfat',l:'Saturated fat',u:'g',dv:20,lim:1},
    {k:'fiber',l:'Fiber',u:'g',dv:28},
    {k:'sugar',l:'Sugars',u:'g',dv:50,lim:1},
    {k:'sodium',l:'Sodium',u:'mg',dv:2300,lim:1},
    {k:'chol',l:'Cholesterol',u:'mg',dv:300,lim:1},
    {k:'potassium',l:'Potassium',u:'mg',dv:4700},
    {k:'calcium',l:'Calcium',u:'mg',dv:1300},
    {k:'iron',l:'Iron',u:'mg',dv:18},
    {k:'vitc',l:'Vitamin C',u:'mg',dv:90},
    {k:'vitd',l:'Vitamin D',u:'mcg',dv:20}
  ];
  function pad(n){return String(n).padStart(2,'0')}
  function fmt(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function r1(v){return Math.round((+v||0)*10)/10}
  return{
    KEY:KEY,NUT:NUT,r1:r1,
    load:function(){try{var o=JSON.parse(localStorage.getItem(KEY));if(o&&Array.isArray(o.entries))return o}catch(e){}return{entries:[],goal:2000}},
    save:function(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch(e){return false}},
    today:function(){return fmt(new Date())},
    shift:function(s,n){var p=s.split('-');return fmt(new Date(+p[0],+p[1]-1,+p[2]+n))},
    esc:function(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML},
    sum:function(items){var t={};NUT.forEach(function(n){t[n.k]=0});
      (items||[]).forEach(function(i){NUT.forEach(function(n){t[n.k]+=+i[n.k]||0})});
      NUT.forEach(function(n){t[n.k]=n.k==='calories'?Math.round(t[n.k]):r1(t[n.k])});return t},
    macros:function(items){var t=this.sum(items);return 'P '+t.protein+'g · C '+t.carbs+'g · F '+t.fat+'g'},
    rows:function(t){ // nutrient rows with % daily value bars (excludes calories)
      return NUT.slice(1).map(function(n){
        var pct=Math.round(t[n.k]/n.dv*100),over=n.lim&&pct>100;
        return '<div class="nrow"><div class="row sp"><span>'+n.l+'</span><span><b>'+t[n.k]+'</b> '+n.u+' <i class="mute">'+pct+'%</i></span></div>'+
        '<div class="mbar'+(over?' over':'')+'"><i style="width:'+Math.min(100,pct)+'%"></i></div></div>';
      }).join('');
    },
    download:function(name,text,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)},
    csv:function(entries){
      var q=function(v){return '"'+String(v).replace(/"/g,'""')+'"'};
      var rows=[['date','time','meal','item','portion'].concat(NUT.map(function(n){return n.l+' ('+n.u+')'}))];
      entries.slice().sort(function(a,b){return a.ts-b.ts}).forEach(function(e){
        var t=new Date(e.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        e.items.forEach(function(i){rows.push([e.date,t,e.meal,i.name,i.portion||''].concat(NUT.map(function(n){return i[n.k]==null?'':i[n.k]})))});
      });
      return rows.map(function(r){return r.map(q).join(',')}).join('\n');
    }
  };
})();
