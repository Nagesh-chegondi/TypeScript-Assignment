
import React, { useState, useEffect, useRef } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import  arrow_down from "../Assets/arrow_down_.png";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  date_start: number;
  date_end: number;
}

interface PageSelection {
  page: number;
  ids: number[];
}

interface PageConfig {
  page: number;
  rows: number;
}

export default function Tablee(): React.ReactElement {
  const [products, setProducts] = useState<Artwork[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Artwork[]>([]);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(12);
  const [page, setPage] = useState<number>(0);

  const op = useRef<OverlayPanel>(null);
  const valv = useRef<HTMLInputElement>(null);
  const p = useRef<PageConfig[]>([]);
  const select = useRef<PageSelection[]>([]);

  const onPageChange = (event: any): void => {
    setFirst(event.first);
    setRows(event.rows);
    setPage(event.first / event.rows);
  };

  useEffect(() => {
    async function getData(): Promise<void> {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page+1}`);
      const data = await response.json();

      const newProducts: Artwork[] = data.data;
      setProducts(newProducts);

      // Restore previous selection for this page
      const pageData = select.current.find((item) => item.page === page);
      if (pageData) {
        const restored = newProducts.filter((d) => pageData.ids.includes(d.id));
        setSelectedProducts(restored);
      } else {
        const dem = p.current.find((item) => item.page === page);
        if (dem) {
          const delta = newProducts.slice(0, dem.rows);
          setSelectedProducts(delta);
        } else {
          setSelectedProducts([]);
        }
      }
    }

    getData();
  }, [page]);

  function handleSelection(e: any): void {
    const selectedItems = e.value as Artwork[];
    setSelectedProducts(selectedItems);

    let existingPage = select.current.find((item) => item.page === page);
    if (!existingPage) {
      existingPage = { page, ids: [] };
      select.current.push(existingPage);
    }

    existingPage.ids = selectedItems.map((item) => item.id);
  }

  function selection(): void {
    const numRows = parseInt(valv.current?.value ?? "0", 10);
    if (isNaN(numRows) || numRows <= 0) return;

    const fullChunks = Math.floor(numRows / 12);
    const last = numRows % 12;

    for (let i = 0; i < fullChunks; i++) {
      if (!p.current.find((x) => x.page === page + i)) {
        p.current.push({ page: page + i, rows: 12 });
      }
    }

    if (last > 0 && !p.current.find((x) => x.page === page + fullChunks)) {
      p.current.push({ page: page + fullChunks, rows: last });
    }

    const dem = p.current.find((item) => item.page === page);
    if (dem) {
      const delta = products.slice(0, dem.rows);
      setSelectedProducts(delta);
    } else {
      setSelectedProducts([]);
    }
  }

  

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column"}} >
      <DataTable
        {...({
          value: products,
          selection: selectedProducts,
          onSelectionChange: handleSelection,
          dataKey: "id",
          tableStyle: { minWidth: "50rem" },
        } as any)}
      >
        <Column 
          selectionMode="multiple"
          header={
            <div className="flex align-items-center gap-2 " style={{display:"flex",justifyContent:"flex-start",alignItems:"center",position:"relative"}}>
              <Button style={{ left:"50px",padding:"0px"}} type="button" className="p-button-text p-0" onClick={(e) => op.current?.toggle(e)}>
                 <img style={{width:"18px",height:"18px",display:"block"}} src={arrow_down} alt="" />
              </Button>
              <OverlayPanel ref={op}>
                <div  style={{ display:"flex",flexDirection:"column",width:"300px",height:"100px",gap:"10px"}}>
                  <input style={{width:"300px",height:"30px"}} ref={valv} type="number" placeholder="select rows..." />
                  <Button label="Submit" size="small" onClick={selection} />
                  
                </div>
              </OverlayPanel>
            </div>
          }
          headerStyle={{  width: "6rem", }}
        />
        
        <Column style={{width:"500px" }} field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="date_start" header="Start_Date" />
        <Column field="date_end" header="End_Date" />
        
      </DataTable>

      <Paginator
        first={first}
        rows={rows}
        totalRecords={18013}
        rowsPerPageOptions={[12]}
        onPageChange={onPageChange}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      />
    </div>
  );
}

