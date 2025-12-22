import {
  Calendar,
  CirclePlus,
  Home,
  Inbox,
  Search,
  Settings,
  Tag,
  ShoppingCart,
  Package,
  Percent,
  Bell,
  ReceiptText,
  User,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";

//Client Page List
const ClientItems = [
  {
    title: "Clients",
    url: "/clients",
    icon: User,
  },
  {
    title: "Create Client",
    url: "/clients/create",
    icon: UserPlus,
  },
];

//Invoice Management
const InvoiceItems = [
  {
    title: "Invoices",
    url: "/invoices",
    icon: ReceiptText,
  },
  {
    title: "Create Invoice",
    url: "/invoices/create",
    icon: CirclePlus,
  },
];


//Product Management
const Productitems=[
  {
    title: "Products & Services",
    url: "/products",
    icon: Package,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Inbox,
  },
  {
    title: "Add Product",
    url: "/products/create",
    icon: CirclePlus,
  },
]

// Menu items.
const items = [
  {
    title: "Coupons",
    url: "/seller-dashboard/coupons",
    icon: Percent,
  },
  {
    title: "Orders",
    url: "/seller-dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Notifications",
    url: "/seller-dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Search",
    url: "/seller-dashboard/search",
    icon: Search,
  },

  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export default function Side() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/">
          <main className="flex justify-center items-center gap-5 pt-1">
            <ReceiptText className="w-16 h-16 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8" />
            <h1 className="group-data-[collapsible=icon]:hidden text-center font-bold text-xl">
              Recharge <br />
              Manager
            </h1>
          </main>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent >
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className=""/>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Manage Client
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                {ClientItems.map((client) => (
                <SidebarMenuItem key={client.title}>
                  <SidebarMenuButton asChild tooltip={client.title}>
                    <a href={client.url}>
                      <client.icon />
                      <span>{client.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Manage Products
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                {Productitems.map((product) => (
                <SidebarMenuItem key={product.title}>
                  <SidebarMenuButton asChild tooltip={product.title}>
                    <a href={product.url}>
                      <product.icon />
                      <span>{product.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Manage Invoices
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                {InvoiceItems.map((invitem) => (
                <SidebarMenuItem key={invitem.title}>
                  <SidebarMenuButton asChild tooltip={invitem.title}>
                    <a href={invitem.url}>
                      <invitem.icon />
                      <span>{invitem.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        
      </SidebarContent>
    </Sidebar>
  );
}
