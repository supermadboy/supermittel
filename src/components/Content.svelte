<script>
	import Speisekammer from './Speisekammer.svelte';
	import Kulturkiosk from './Kulturkiosk.svelte';
	import Barac from './Barac.svelte';
	import Project from './Project.svelte';

  const projects = [
    {
      title: 'Kulturkiosk Schranke',
      image: Kulturkiosk,
      href: 'https://kulturkiosk-schranke.de/',
      text: `Der Kulturkiosk Schranke ist mehr als nur ein Kiosk und
        zwar finden hier auch Events und Workshops statt. Außerdem gibt
        es ein Spitzenangebot an Getränken und wöchtentlich wechselnden
        Speisen.`,
    },
    {
      title: 'Speisekammer Konstanz',
      image: Speisekammer,
      href: 'https://speisekammer-konstanz.de/',
      text: `Die Speisekammer Konstanz ist ein Verein,
        der sich als Einkaufsgemeinschaft die Förderung 
        eines Lebensmittelsystems zum Wohle des Lebens von
        Menschen, Tieren und Pflanzen zum Zweck gemacht hat.`,
    },
    {
      title: 'barac Mannheim',
      image: Barac,
      href: 'http://www.barac-mannheim.com/',
      text: `barac ist temporäres Künstleratelier, Werkstatt, Manufaktur,
        Erdlabor, Farblabor, Küchenlabor, Inklusion und Wohnen. (Quelle: barac mannheim)`,
    },
  ]
</script>

<div class="p-6 flex-grow overflow-y-auto bg-primary">
  <div class="flex gap-6 flex-col sm:flex-row flex-wrap">
    {#each projects as project}
      <Project {...project}></Project>
	  {/each}
  </div>
</div>	