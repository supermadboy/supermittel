<script>
	import Speisekammer from './Speisekammer.svelte';
	import Kulturkiosk from './Kulturkiosk.svelte';
	import Barac from './Barac.svelte';
	import Project from './Project.svelte';
	import Brotalgut from './Brotalgut.svelte';

  const projects = [
    {
      title: 'Brotal gut',
      image: Brotalgut,
      href: 'https://www.brotalgut-konstanz.de/',
      text: `Brotalgut ist eine transparenten Backstube
        in der mehrmals täglich frisches Sauerteigbrot
        gebacken wird. Handgemachte Produkte, mit besten
        regionalen Rohstoffen, im kleinen Familienbetrieb
        in Konstanz am Bodensee.`,
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
        Erdlabor, Farblabor, Küchenlabor, Inklusion und Wohnen. (Quelle: barac mannheim)
        Gestaltung ist von Raum Mannheim`,
    },
    {
      title: 'Kulturkiosk Schranke',
      image: Kulturkiosk,
      href: 'https://kulturkiosk-schranke.de/',
      text: `Der Kulturkiosk Schranke ist ein Nachbarschaftsprojekt in Konstanz,
        Petershausen-West. Neben einem nachhaltigen Produktsortiment finden
        auch regelmäßig Events und Workshops statt.`,
    },
  ]
</script>

<div class="p-6 flex-grow overflow-y-auto bg-primary hide-scrollbar">
  <div class="flex gap-12 flex-col sm:flex-row flex-wrap">
    {#each projects as project}
      <Project {...project}></Project>
	  {/each}
  </div>
</div>

<style>
   /* Hide scrollbar for Chrome, Safari and Opera */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  } 
</style>